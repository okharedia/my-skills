---
name: 1password
description: Injects 1Password secret references into a trusted child process with `op run`. Use when a command needs an API key, token, or other secret stored in 1Password. The child receives plaintext; stdout/stderr masking is exact-string only.
license: MIT
compatibility: Requires macOS, 1Password CLI 2.18 or later, and a service-account token stored in the login keychain. Free-text title filtering also requires jq.
metadata:
  author: okharedia
  version: "2.0.1"
---

# 1Password

Authentication uses a 1Password service-account token in the macOS login keychain. The agent reads that token into a shell variable, then into `op`'s environment. The real security boundary is a dedicated, read-only, vault-limited service account — not this skill's rules.

Never ask the user to paste a token into chat. Never run setup for them.

## One-time setup

The user runs this in their own Terminal and pastes the `ops_...` token at the prompt.

```sh
printf 'Token: '
stty -echo
trap 'stty echo' EXIT INT
IFS= read -r T
stty echo
trap - EXIT INT
printf '\n'
security add-generic-password -U -a "$USER" -s op-agent -w "$T"
unset T
```

The interactive `security add-generic-password -w` prompt (no value) truncates at 128 characters and stores a broken token. Passing `-w "$T"` stores the full token but exposes it in process arguments while `security` runs. History records the literal `$T`, not the value. The login keychain is readable by other processes as this user while logged in.

## Auth prefix

Load the token first. If `security` fails or the value is empty, stop and tell the user to redo setup. Do not run `op`. Do not fall back to `op signin`, an environment token, or the desktop app.

```sh
token="$(security find-generic-password -a "$USER" -s op-agent -w)"
if [ $? -ne 0 ] || [ -z "$token" ]; then
  echo "1Password keychain item missing. Ask the user to redo setup." >&2
  # stop — do not continue
fi
```

Prefix every `op` invocation with:

```sh
OP_SERVICE_ACCOUNT_TOKEN="$token" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
```

Then `unset token` when finished.

`OP_BIOMETRIC_UNLOCK_ENABLED=false` disables desktop-app integration. A failed keychain read otherwise becomes an empty `OP_SERVICE_ACCOUNT_TOKEN`, which `op` treats as "no service account" and may sign in as the human user with every vault.

## Use a secret

Inject an `op://` reference into the environment of `op run`. Do not print the token or the resolved secret.

```sh
OP_SERVICE_ACCOUNT_TOKEN="$token" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
API_TOKEN='op://Vault/Item/password' \
  op run -- trusted-command
```

Field names: `password` for Login/Password items, `credential` for API Credential items. Use the field the user named. Do not guess by retrying fields.

`trusted-command` is the smallest executable that must read the secret from its environment. Do not wrap package-manager scripts (`npm test`, `yarn`, `pnpm`), shells (`bash -c`, `sh -c`), `env`, or other untrusted code. Do not put the resolved secret on the command line.

`op run` sets plaintext in the child environment. It masks the exact secret string on the child's stdout and stderr only. A value written to a file, sent over the network, encoded, or printed in part is not masked.

## Find the narrowest match

Prefix every `op` command with the auth prefix above. Prefer an exact item or secret reference over vault enumeration.

If the vault is unknown and its name is necessary:

```sh
op vault list
```

If the exact item name is known, inspect it without `--reveal`:

```sh
op item get "Item" --vault "Vault"
```

This may display metadata and non-concealed fields (usernames, URLs, notes). Use it only when that output is needed.

If a tag or category is known, filter at the source:

```sh
op item list --vault "Vault" --tags "project-name"
op item list --vault "Vault" --categories "API Credential"
```

The CLI has no free-text title-search flag. When the user asks to search a known vault, filter locally and return only IDs and titles:

```sh
op item list --vault "Vault" --format=json |
  jq -r --arg q "search-term" \
    '.[] | select(.title | ascii_downcase | contains($q | ascii_downcase)) | [.id, .title] | @tsv'
```

This narrows agent output, but `op` still retrieves all item metadata for that vault. It is not an access-control boundary. If nothing matches, ask the user instead of falling back to an unfiltered list.

## Rules

- Never print, log, echo, or commit the token or a resolved secret.
- Never use `op read` alone, `--reveal`, `--no-masking`, or `OP_RUN_NO_MASKING`.
- Do not create, modify, delete, move, or share items. The skill cannot enforce this; use a read-only service account limited to the agent vault.
- If the keychain item is missing or authentication fails, stop. Do not fall back to `op signin`, an environment token, or asking for a token in chat.
