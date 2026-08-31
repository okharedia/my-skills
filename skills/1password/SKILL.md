---
name: 1password
description: Reads secrets from 1Password using the 1Password CLI. Use when a command needs an API key, token, credential, or other secret.
license: MIT
metadata:
  author: okharedia
  version: "1.0.0"
---

# 1Password

Use the `op` CLI directly. Assume authentication is already configured.

## Read-only commands

List vaults:

```sh
op vault list
```

Inspect an item and its field names without revealing concealed values:

```sh
op item get "Item" --vault "Vault"
```

Read one exact field:

```sh
op read "op://Vault/Item/field"
```

If the item name is unknown, ask the user for it. Do not enumerate all items in a vault unless the user explicitly requests that.

## Safety

- Use read-only commands only. Do not create, modify, delete, move, or share items through this skill.
- Do not use `--reveal` with `op item get`; use `op read` for one exact field.
- Never print, log, paste into chat, commit, or persist a retrieved secret.
- Pass a retrieved secret only to the command that needs it.
