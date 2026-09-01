# my-skills

Reusable agent skills for Codex and other Agent Skills-compatible tools.

## Skills

| Skill | Purpose |
| --- | --- |
| `tldr` | Keeps every user-facing response concise and easy to scan. |
| `teach-me` | Teaches from a named source at the learner's level, with a versioned `notes/book.md`. |
| `1password` | Finds secrets narrowly and injects them into trusted commands without exposing their values. |

## Install

List the available skills:

```sh
npx skills add okharedia/my-skills --list
```

Install globally for Codex:

```sh
npx skills add okharedia/my-skills --skill tldr --skill teach-me --skill 1password --agent codex --global
```

Install one skill:

```sh
npx skills add okharedia/my-skills --skill teach-me --agent codex --global
```

Omit `--global` for a project-only installation.

## Update

Update global installations from the latest release on `main`:

```sh
npx skills update tldr teach-me 1password --global
```

The installer detects updates from repository content changes. The version in each skill's metadata and the Git tags provide human-readable release history.

## Releases

The latest stable release is on `main`. Releases use semantic version tags such as `v1.1.0`; changes are recorded in [CHANGELOG.md](CHANGELOG.md).

## License

MIT
