# Changelog

## 2.1.0 - 2026-09-06

- Add `site` 0.3.1: publish private files and static sites to Cloudflare R2 and gate them with
  Access, as inline Bash using rclone, curl, and jq. Each app is created with an empty allowlist
  and is readable by nobody until an email is shared in; the API token is the way back in.
  Upload validates the app name, refuses a non-empty prefix, and refuses a path already covered
  by another application, then confirms Access gates the new prefix. Remove deletes the policy
  before purging, so nothing is readable while objects are still being deleted.
- `1password` 2.0.3: allow `op run -- bash -s` with a single-quoted heredoc, for tasks whose
  commands must share one injected environment. `bash -c` stays forbidden; it puts the script in
  process arguments.
- `1password` 2.0.3: hold the exit status in `rc`. `status` is read-only in zsh, so the
  documented blocks aborted with an error after the work had already run.

## 2.0.2 - 2026-09-03

- `tldr` 1.0.1: add a writing rule to remove all mannered prose.

## 2.0.1 - 2026-09-02

- `1password` 2.0.1: document that setup puts the token in process arguments and that use puts it in a shell variable.
- Restore narrow item discovery from 1.1.0 (tags, categories, local title filter).
- Fail closed on a missing keychain item instead of an empty token; every `op` example is one script (load, validate, invoke, unset, exit).
- Setup refuses a failed or empty read so it cannot overwrite an existing keychain item, and preserves the `security` exit status.
- Restore least-privilege service-account guidance as the access-control boundary.
- Define `trusted-command` and state `op run` masking limits in the description.

## 2.0.0 - 2026-09-02

- `1password` 2.0.0: authenticate with a service-account token read from the macOS login keychain.
- Pass the token into the command environment only; never a dotfile, shell variable, argument, or chat message.
- Add a one-time setup command that stores the token without echoing it, avoiding the macOS `security` prompt that truncates input at 128 characters.

## 1.2.3 - 2026-09-01

- `teach-me` 1.0.3: reread the notebook for reading order; drop editor-agent language.

## 1.2.2 - 2026-09-01

- `teach-me`: add an editor pass so the notebook is reading-order, not conversation-order.

## 1.2.1 - 2026-09-01

- `teach-me`: the notebook states the correct model only; do not record the learner's wrong guesses.

## 1.2.0 - 2026-09-01

- Publish `teach-me` for source-following, paced teaching with a versioned `notes/book.md`.

## 1.1.0 - 2026-08-31

- Replace standalone secret reads with masked `op run` injection into trusted commands.
- Add narrow item discovery by exact name, tag, category, or locally filtered title.
- Fail closed when the CLI or authentication is unavailable.
- Remove credential-setup helpers and document least-privileged vault access as the security boundary.

## 1.0.0 - 2026-08-31

- Publish `tldr` with automatic activation guidance.
- Publish `1password` with a minimal, read-only CLI workflow.
