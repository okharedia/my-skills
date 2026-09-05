# my-skills

Reusable agent skills for Codex and other Agent Skills-compatible tools.

## Skills

| Skill | Purpose |
| --- | --- |
| `tldr` | Keeps every user-facing response concise and easy to scan. |
| `teach-me` | Teaches from a named source at the learner's level, with a versioned `notes/book.md`. |
| `1password` | Injects 1Password secret references into trusted commands. The child receives plaintext. |
| `site` | Manages private apps and static sites with Cloudflare R2 and Access. |

## Install

List the available skills:

```sh
npx skills add okharedia/my-skills --list
```

Install globally for Codex:

```sh
npx skills add okharedia/my-skills --skill tldr --skill teach-me --skill 1password --skill site --agent codex --global
```

Install one skill:

```sh
npx skills add okharedia/my-skills --skill teach-me --agent codex --global
```

Omit `--global` for a project-only installation.

### 1Password prerequisites

The `1password` skill needs macOS, 1Password CLI 2.18 or later, and a dedicated read-only service account limited to the vaults the agent may see. The setup command is in [the skill](skills/1password/SKILL.md); run it yourself and never let an agent handle the token. The child process receives plaintext secrets; `op run` masking is stdout/stderr exact-string only.

### Site prerequisites

The `site` skill uses Bash, rclone, curl, jq, and 1Password. The R2 bucket, the custom hostname, and a Cloudflare Access application covering that hostname must already exist. Each app is created with an empty allowlist and is readable by nobody until an email is shared in. See [setup and commands](skills/site/SKILL.md).

## Update

Update global installations from the latest release on `main`:

```sh
npx skills update tldr teach-me 1password site --global
```

The installer detects updates from repository content changes. The version in each skill's metadata and the Git tags provide human-readable release history.

## Releases

The latest stable release is on `main`. Releases use semantic version tags such as `v2.0.0`; changes are recorded in [CHANGELOG.md](CHANGELOG.md).

## License

MIT
