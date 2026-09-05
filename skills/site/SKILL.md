---
name: site
description: Publishes private files and static sites to Cloudflare R2 with rclone and manages email access with curl and jq.
license: MIT
compatibility: Requires Bash, rclone, curl, jq, 1Password CLI, and the 1password skill.
metadata:
  author: okharedia
  version: "0.3.1"
---

# Site

Use the 1password skill to inject these values. Find them in the 1password vault

```text
CF_ACCOUNT_ID
CF_API_TOKEN
SITE_HOSTNAME
SITE_BUCKET
RCLONE_CONFIG_SITE_ACCESS_KEY_ID
RCLONE_CONFIG_SITE_SECRET_ACCESS_KEY
RCLONE_CONFIG_SITE_ENDPOINT
```



## Helper

```sh
export RCLONE_CONFIG_SITE_TYPE=s3
export RCLONE_CONFIG_SITE_PROVIDER=Cloudflare
export RCLONE_CONFIG_SITE_NO_CHECK_BUCKET=true

app=dashboard
source=/absolute/path/to/public
domain="$SITE_HOSTNAME/$app/*"
remote="site:$SITE_BUCKET/$app/"
api="https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/access/apps"

cf() {
  local method=$1 url=$2 body=${3-}
  if [[ -n $body ]]; then
    curl -fsS -X "$method" -H "Authorization: Bearer $CF_API_TOKEN" \
      -H 'Content-Type: application/json' --data "$body" "$url"
  else
    curl -fsS -X "$method" -H "Authorization: Bearer $CF_API_TOKEN" "$url"
  fi | jq 'if .success then .result else error(.errors | tostring) end'
}
# no -e: revoke_tokens returns a null result

cf_list() {
  local url=$1 page=1 total=1 body
  while (( page <= total )); do
    body=$(curl -fsS -H "Authorization: Bearer $CF_API_TOKEN" "$url?per_page=50&page=$page" \
      | jq -e 'if .success then . else error(.errors | tostring) end')
    total=$(jq -r '.result_info.total_pages // 1' <<<"$body")
    jq -c '.result[]' <<<"$body"
    (( page++ ))
  done | jq -s '.'
}
```



## Upload

```sh
if [[ ! $app =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ ]]; then
  echo "App name is not lowercase letters, numbers, and hyphens. Stop and report it." >&2
  exit 1
fi

if [[ -n $(rclone --config /dev/null lsf "$remote" --recursive) ]]; then
  echo "Prefix $app/ already has objects. Stop and report it." >&2
  exit 1
fi

apps=$(cf_list "$api")
if ! jq -e --arg new "$SITE_HOSTNAME/$app/" --arg host "$SITE_HOSTNAME" '
       [ .[] | .domain
         | select(startswith($host + "/"))
         | rtrimstr("*") as $d
         | select(($d | startswith($new)) or ($new | startswith($d)))
       ] | length == 0
     ' <<<"$apps" >/dev/null; then
  echo "An Access application already covers this app's path. Stop and report it." >&2
  exit 1
fi

body=$(jq -cn --arg name "Site: $app" --arg domain "$domain" '
  {name:$name, domain:$domain, type:"self_hosted", session_duration:"24h", policies:[]}
')
app_id=$(cf POST "$api" "$body" | jq -er '.id')
```

Upload one file:

```sh
rclone --config /dev/null copyto "$source" "$remote$(basename "$source")" \
  --metadata --metadata-set 'cache-control=private, no-store'
```

Upload a directory:

```sh
rclone --config /dev/null copy "$source/" "$remote" \
  --metadata --metadata-set 'cache-control=private, no-store'
```

Replace a directory:

```sh
rclone --config /dev/null sync "$source/" "$remote" --delete-after \
  --metadata --metadata-set 'cache-control=private, no-store'
```

List uploaded files:

```sh
rclone --config /dev/null lsf "$remote" --recursive
```

Confirm Access gates the new prefix:

```sh
if curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
     "https://$SITE_HOSTNAME/$app/index.html" \
     | grep -qE '^302 https://[^/]+\.cloudflareaccess\.com/'; then
  echo "gated"
else
  echo "NOT gated. Stop and report it." >&2
  exit 1
fi
```

Never print the redirect URL; it carries a JWT. Whether a permitted reader actually receives
the object can only be checked in an authenticated browser.

Return URLs as `https://$SITE_HOSTNAME/$app/<path>`. R2 does not serve an implicit index;
return the explicit `/index.html` URL for a site.

## Access

Find the app's Access application and local Allow policy:

```sh
apps=$(cf_list "$api")
app_id=$(jq -er --arg domain "$domain" '
  [.[] | select(.domain == $domain)]
  | if length == 1 then .[0].id else error("Expected one application") end
' <<<"$apps")

policies=$(cf_list "$api/$app_id/policies")
allow=$(jq -c '[.[] | select(.decision == "allow")]' <<<"$policies")
case $(jq 'length' <<<"$allow") in
  0) policy='' ;;
  1) policy=$(jq -c '.[0]' <<<"$allow"); policy_id=$(jq -er '.id' <<<"$policy") ;;
  *) echo "Expected at most one Allow policy. Stop and report it." >&2; exit 1 ;;
esac
```

An app with no policy denies everyone, so the first share creates one.

Set `action` to `share` or `unshare`:

```sh
action=share
email=$(printf '%s' reader@example.com | tr '[:upper:]' '[:lower:]')

if [[ -z $policy ]]; then
  body=$(jq -cn --arg email "$email" '
    {name:"Site allowlist", decision:"allow", include:[{email:{email:$email}}]}
  ')
  cf POST "$api/$app_id/policies" "$body" >/dev/null
else
  body=$(jq -c --arg action "$action" --arg email "$email" '
    if $action == "share" then
      .include += [{email:{email:$email}}] | .include |= unique
    else
      .include |= map(select(.email.email != $email))
    end
    | del(.id, .uid, .created_at, .updated_at)
  ' <<<"$policy")
  cf PUT "$api/$app_id/policies/$policy_id" "$body" >/dev/null
fi
```

Unsharing the last reader leaves an empty Include list, which denies everyone. Delete the
policy to return the app to its created state.

After unsharing, revoke the app's sessions:

```sh
cf POST "$api/$app_id/revoke_tokens" '{}' >/dev/null
```



## Remove

Deleting the policy first denies everyone while the objects are still being removed:

```sh
cf DELETE "$api/$app_id/policies/$policy_id" >/dev/null
cf POST "$api/$app_id/revoke_tokens" '{}' >/dev/null
rclone --config /dev/null purge "$remote"

if [[ -n $(rclone --config /dev/null lsf "$remote" --recursive) ]]; then
  echo "Prefix $app/ is not empty. Stop and report it." >&2
  exit 1
fi
cf DELETE "$api/$app_id" >/dev/null
```