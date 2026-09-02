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

Each `op` snippet below is one complete script. Run it in a single shell. Do not reuse `$token` in a later tool call.

## One-time setup

The user runs this in their own Terminal and pastes the `ops_...` token at the prompt. The subshell exits on a failed or empty read so `security` never runs; EOF or a blank paste cannot overwrite an existing item.

```sh
(
  printf 'Token: '
  stty -echo
  trap 'stty echo; unset T' EXIT
  if ! IFS= read -r T || [ -z "$T" ]; then
    echo "No token entered; keychain unchanged." >&2
    exit 1
  fi
  printf '\n'
  security add-generic-password -U -a "$USER" -s op-agent -w "$T"
  status=$?
  unset T
  exit "$status"
)
```

The interactive `security add-generic-password -w` prompt (no value) truncates at 128 characters and stores a broken token. Passing `-w "$T"` stores the full token but exposes it in process arguments while `security` runs. History records the literal `$T`, not the value. The login keychain is readable by other processes as this user while logged in.

## Use a secret

Load, validate, invoke, capture status, and `unset` in this one block. If the keychain read fails or is empty, `exit 1` before `op`. Do not fall back to `op signin`, an environment token, or the desktop app.

```sh
if ! token="$(security find-generic-password -a "$USER" -s op-agent -w)" || [ -z "$token" ]; then
  echo "1Password keychain item missing. Ask the user to redo setup." >&2
  exit 1
fi
OP_SERVICE_ACCOUNT_TOKEN="$token" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
API_TOKEN='op://Vault/Item/password' \
  op run -- trusted-command
status=$?
unset token
exit "$status"
```

`OP_BIOMETRIC_UNLOCK_ENABLED=false` disables desktop-app integration. A failed keychain read otherwise becomes an empty `OP_SERVICE_ACCOUNT_TOKEN`, which `op` treats as "no service account" and may sign in as the human user with every vault.

Field names: `password` for Login/Password items, `credential` for API Credential items. Use the field the user named. Do not guess by retrying fields.

`trusted-command` is the smallest executable that must read the secret from its environment. Do not wrap package-manager scripts (`npm test`, `yarn`, `pnpm`), shells (`bash -c`, `sh -c`), `env`, or other untrusted code. Do not put the resolved secret on the command line.

`op run` sets plaintext in the child environment. It masks the exact secret string on the child's stdout and stderr only. A value written to a file, sent over the network, encoded, or printed in part is not masked.

## Find the narrowest match

Prefer an exact item or secret reference over vault enumeration. Use the same load / validate / `unset` / `exit` shape; only the `op` command changes.

If the vault is unknown and its name is necessary:

```sh
if ! token="$(security find-generic-password -a "$USER" -s op-agent -w)" || [ -z "$token" ]; then
  echo "1Password keychain item missing. Ask the user to redo setup." >&2
  exit 1
fi
OP_SERVICE_ACCOUNT_TOKEN="$token" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
  op vault list
status=$?
unset token
exit "$status"
```

If the exact item name is known, inspect it without `--reveal`:

```sh
if ! token="$(security find-generic-password -a "$USER" -s op-agent -w)" || [ -z "$token" ]; then
  echo "1Password keychain item missing. Ask the user to redo setup." >&2
  exit 1
fi
OP_SERVICE_ACCOUNT_TOKEN="$token" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
  op item get "Item" --vault "Vault"
status=$?
unset token
exit "$status"
```

This may display metadata and non-concealed fields (usernames, URLs, notes). Use it only when that output is needed.

If a tag or category is known, filter at the source:

```sh
if ! token="$(security find-generic-password -a "$USER" -s op-agent -w)" || [ -z "$token" ]; then
  echo "1Password keychain item missing. Ask the user to redo setup." >&2
  exit 1
fi
OP_SERVICE_ACCOUNT_TOKEN="$token" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
  op item list --vault "Vault" --tags "project-name"
status=$?
unset token
exit "$status"
```

```sh
if ! token="$(security find-generic-password -a "$USER" -s op-agent -w)" || [ -z "$token" ]; then
  echo "1Password keychain item missing. Ask the user to redo setup." >&2
  exit 1
fi
OP_SERVICE_ACCOUNT_TOKEN="$token" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
  op item list --vault "Vault" --categories "API Credential"
status=$?
unset token
exit "$status"
```

The CLI has no free-text title-search flag. When the user asks to search a known vault, filter locally and return only IDs and titles:

```sh
if ! token="$(security find-generic-password -a "$USER" -s op-agent -w)" || [ -z "$token" ]; then
  echo "1Password keychain item missing. Ask the user to redo setup." >&2
  exit 1
fi
set -o pipefail
OP_SERVICE_ACCOUNT_TOKEN="$token" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
  op item list --vault "Vault" --format=json |
  jq -r --arg q "search-term" \
    '.[] | select(.title | ascii_downcase | contains($q | ascii_downcase)) | [.id, .title] | @tsv'
status=$?
unset token
exit "$status"
```

This narrows agent output, but `op` still retrieves all item metadata for that vault. It is not an access-control boundary. If nothing matches, ask the user instead of falling back to an unfiltered list.

## Rules

- Never print, log, echo, or commit the token or a resolved secret.
- Never use `op read` alone, `--reveal`, `--no-masking`, or `OP_RUN_NO_MASKING`.
- Do not create, modify, delete, move, or share items. The skill cannot enforce this; use a read-only service account limited to the agent vault.
- If the keychain item is missing or authentication fails, stop. Do not fall back to `op signin`, an environment token, or asking for a token in chat.
