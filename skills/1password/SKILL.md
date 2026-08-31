---
name: 1password
description: Finds and supplies secrets from 1Password to trusted commands without exposing their values in agent output. Use when a command needs an API key, token, credential, or other secret stored in 1Password.
license: MIT
compatibility: Requires the 1Password CLI. Free-text title filtering also requires jq.
metadata:
  author: okharedia
  version: "1.1.0"
---

# 1Password

Use the `op` CLI directly. Assume authentication is already configured. If `op` is unavailable or authentication fails, stop and ask the user to fix the setup. Do not sign in, configure 1Password, or request credentials in chat.

## Use a known secret

Inject an exact secret reference only into the trusted command that needs it:

```sh
API_TOKEN='op://Vault/Item/field' \
  op run -- trusted-command
```

`op run` resolves the reference for its child process and masks exact secret values in output by default. Use only trusted commands. Never use `--no-masking`.

## Find the narrowest match

Use the least broad discovery command that can answer the request.

If the vault is unknown and its name is necessary:

```sh
op vault list
```

If the exact item name is known, inspect it without `--reveal`:

```sh
op item get "Item" --vault "Vault"
```

This may display item metadata and non-concealed fields. Use it only when that output is needed.

If a relevant tag or category is known, filter at the source:

```sh
op item list --vault "Vault" --tags "project-name"
op item list --vault "Vault" --categories "API Credential"
```

The CLI has no free-text title-search flag. When the user asks to search a known vault, filter item metadata locally and return only IDs and titles:

```sh
op item list --vault "Vault" --format=json |
  jq -r --arg q "search-term" \
    '.[] | select(.title | ascii_downcase | contains($q | ascii_downcase)) | [.id, .title] | @tsv'
```

This narrows what appears in agent output, but `op` still retrieves all item metadata for that vault locally. It is not an access-control boundary. If nothing matches, ask the user instead of falling back to an unfiltered item list.

## Safety

- Prefer an exact item or secret reference over vault enumeration.
- Use only read-only discovery commands and `op run`. Do not create, modify, delete, move, or share items.
- Never run `op read` by itself or use `--reveal` or `--no-masking`.
- Never print, log, paste into chat, commit, or persist a resolved secret.
- Use only preconfigured, least-privileged access. A dedicated agent vault or vault-limited service account is the real security boundary.
