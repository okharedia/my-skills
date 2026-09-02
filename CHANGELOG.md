# Changelog

## 2.0.1 - 2026-09-02

- `1password` 2.0.1: document that setup puts the token in process arguments and that use puts it in a shell variable.
- Restore narrow item discovery from 1.1.0 (tags, categories, local title filter).
- Fail closed on a missing keychain item instead of an empty token; every `op` example is one script (load, validate, invoke, unset, exit).
- Setup refuses an empty read so it cannot overwrite an existing keychain item.
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
