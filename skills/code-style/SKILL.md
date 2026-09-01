---
name: code-style
description: Bootstrap deterministic formatter and linter config files for JS/TS, Go, or Python. Use when setting up a new repo or standardizing code style. Emits config files that tools like ESLint, gofmt, and Ruff can read to auto-fix code.
license: MIT
metadata:
  author: okharedia
  version: "1.0.0"
---

# Code Style

Bootstrap deterministic code style configuration. Detects languages in the repo and emits config files that standard tools consume to auto-fix code.

## Supported Languages

| Language | Detection | Tools |
|----------|-----------|-------|
| JS/TS | `tsconfig.json`, `package.json`, `.js`, `.ts`, `.jsx`, `.tsx` | ESLint + @stylistic/eslint-plugin |
| Go | `go.mod`, `.go` | gofmt + golangci-lint |
| Python | `pyproject.toml`, `requirements.txt`, `.py` | Ruff |

## What Gets Emitted

### JS/TS
- `eslint.config.js` — ESLint flat config with @stylistic rules
- `eslint-local-plugin.js` — Custom rules (destructure-param-newline, padding)
- `.editorconfig` — Tab width 8, charset utf-8
- `.vscode/settings.json` — Format-on-save, ESLint integration
- `.vscode/extensions.json` — Recommends ESLint extension

### Go
- `.golangci.yml` — Default linter set (errcheck, gosimple, govet, ineffassign, staticcheck, unused)
- `.editorconfig` — Tab width 8 (display hint; gofmt uses tabs)
- `.vscode/settings.json` — Format-on-save, golangci-lint integration
- `.vscode/extensions.json` — Recommends Go extension

### Python
- `ruff.toml` — Ruff formatter + linter config
- `.editorconfig` — 4-space indent (PEP8), charset utf-8
- `.vscode/settings.json` — Format-on-save, Ruff integration
- `.vscode/extensions.json` — Recommends Ruff extension

## Style Rules

| Rule | JS/TS | Go | Python |
|------|-------|-----|--------|
| Indentation | Tabs (8-space display) | Tabs (8-space display) | 4 spaces |
| Line width | 999 | gofmt default | 999 |
| Braces | Allman | gofmt default | N/A |
| Quotes | Double | N/A | Double |
| Semicolons | Always | N/A | N/A |
| Trailing commas | All | N/A | N/A |

## Behavior

1. **Detect languages** — Scan repo for language markers
2. **Emit config files** — Copy templates for each detected language
3. **Overwrite existing** — Replace any existing config (deterministic, no merge)
4. **Emit shared files** — `.editorconfig` and `.vscode/` settings
5. **Git commit** — If in a git repo, auto-commit with `chore: add code style config for <languages>`
6. **Non-git warning** — If not a git repo, warn and skip commit

## Instructions

When invoked, perform these steps:

### Step 1: Detect Languages

Check for language markers:

```
JS/TS: tsconfig.json OR package.json OR any .js/.ts/.jsx/.tsx file
Go: go.mod OR any .go file
Python: pyproject.toml OR requirements.txt OR any .py file
```

Report which languages were detected.

### Step 2: Emit Config Files

For each detected language, read the corresponding templates from this skill's `templates/` directory and write them to the repo root (or appropriate location).

**JS/TS templates:**
- `templates/js/eslint.config.js` → `eslint.config.js`
- `templates/js/eslint-local-plugin.js` → `eslint-local-plugin.js`
- `templates/js/editorconfig` → `.editorconfig`
- `templates/js/vscode-settings.json` → `.vscode/settings.json`
- `templates/js/vscode-extensions.json` → `.vscode/extensions.json`

**Go templates:**
- `templates/go/golangci.yml` → `.golangci.yml`
- `templates/go/editorconfig` → `.editorconfig`
- `templates/go/vscode-settings.json` → `.vscode/settings.json`
- `templates/go/vscode-extensions.json` → `.vscode/extensions.json`

**Python templates:**
- `templates/python/ruff.toml` → `ruff.toml`
- `templates/python/editorconfig` → `.editorconfig`
- `templates/python/vscode-settings.json` → `.vscode/settings.json`
- `templates/python/vscode-extensions.json` → `.vscode/extensions.json`

**Multi-language repos:** Merge `.editorconfig` sections and `.vscode/` settings intelligently.

### Step 3: Document Dependencies

After emitting files, tell the user what dependencies to install:

**JS/TS:**
```sh
npm install -D eslint @stylistic/eslint-plugin @babel/eslint-parser @babel/core
```

**Go:**
```sh
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

**Python:**
```sh
pip install ruff
# or: uv add --dev ruff
```

### Step 4: Git Commit (if applicable)

If the directory is a git repo:

1. Stage all changed/new config files
2. Commit with message: `chore: add code style config for JS/TS, Go, Python` (list only detected languages)
3. Do NOT push

If not a git repo, warn: "Not a git repo. Skipping commit. Files have been written but are not version-controlled."

### Step 5: Verify

Run a quick check to confirm tools work:

**JS/TS:** `npx eslint --max-warnings 0 .` (expect it to run, may report fixable issues)
**Go:** `golangci-lint run` (expect it to run)
**Python:** `ruff check .` (expect it to run)

Report success or any issues.
