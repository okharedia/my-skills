---
name: 1password
description: Reads secrets from 1Password and injects them into trusted commands without exposing their values. Use when a command needs an API key, token, credential, or other secret stored in 1Password.
license: MIT
compatibility: Requires macOS, the 1Password CLI, and a service-account token stored in the login keychain.
metadata:
  author: okharedia
  version: "2.0.0"
---

# 1Password

Authentication uses a 1Password service-account token kept in the macOS login keychain.

## One-time setup

The user runs this themselves and pastes the `ops_...` token at the prompt. It is not echoed:

```sh
printf 'Token: '; stty -echo; IFS= read -r T; stty echo; echo
security add-generic-password -U -a "$USER" -s op-agent -w "$T"; unset T
```

The interactive `security add-generic-password -w` prompt truncates input at 128 characters, which silently stores a broken token.

## Use a secret

Read the token from the keychain into the command's environment and inject the secret by reference. Neither value is ever printed:

```sh
OP_SERVICE_ACCOUNT_TOKEN="$(security find-generic-password -a "$USER" -s op-agent -w)" \
OP_BIOMETRIC_UNLOCK_ENABLED=false \
API_TOKEN='op://Vault/Item/credential' \
  op run -- trusted-command
```

`op run` masks the secret only when the command prints its exact value to stdout or stderr. A value that is written to a file, sent over the network, encoded, or printed in part is not masked. The command receives the real secret in its environment, so run only commands you trust.

`OP_BIOMETRIC_UNLOCK_ENABLED=false` turns off 1Password's desktop app integration. If the keychain read fails, the command substitution yields an empty string rather than an error, and `op` reads an empty token as "no service account" — signing in through the desktop app instead, under a different account with different vaults. This flag makes it fail instead.

## Find an item

Prefix these with the same `OP_SERVICE_ACCOUNT_TOKEN` and `OP_BIOMETRIC_UNLOCK_ENABLED` assignments:

```sh
op vault list
op item list --vault "Vault"
op item get "Item" --vault "Vault"
```



## Rules

- Never print, log, echo, or commit the token or a resolved secret.
- Never use `op read` alone, `--reveal`, `--no-masking`, or `OP_RUN_NO_MASKING`.
- Read only. Do not create, modify, delete, move, or share items.
- If the keychain item is missing or authentication fails, stop and tell the user to redo setup. Do not fall back to `op signin`, an environment token, or asking for a token in chat.
