---
name: code-style
description: >-
  Bootstrap deterministic formatter/linter config for JS/TS, Go, or Python, and
  apply beyond-linting JS/TS conventions: get/find/list retrieval naming,
  Make… factory DI, and backend module/folder structure. Use when setting up a
  repo, standardizing style, naming accessors, writing injectable units,
  organizing src/modules, or scaffolding CONTRIBUTING/AGENTS guidance.
license: MIT
metadata:
  author: okharedia
  version: "1.2.0"
---

# Code Style

Two jobs in one skill:

1. **Formatter / linter bootstrap** — detect languages and emit deterministic config files (ESLint, gofmt/golangci-lint, Ruff).
2. **Beyond-linting conventions (JS/TS)** — retrieval naming (`get` / `find` / `list`), factory DI (`Make…`), and backend module/folder structure.

When scaffolding a repo, do both: emit tool configs **and** put the conventions in `CONTRIBUTING.md` with a pointer from `AGENTS.md`.

---

## Part A — Formatter and linter bootstrap

Bootstrap deterministic code style configuration. Detects languages in the repo and emits config files that standard tools consume to auto-fix code.

### Supported Languages

| Language | Detection | Tools |
|----------|-----------|-------|
| JS/TS | `tsconfig.json`, `package.json`, `.js`, `.ts`, `.jsx`, `.tsx` | ESLint + @stylistic/eslint-plugin |
| Go | `go.mod`, `.go` | gofmt + golangci-lint |
| Python | `pyproject.toml`, `requirements.txt`, `.py` | Ruff |

### What Gets Emitted

#### JS/TS
- `eslint.config.js` — ESLint flat config with @stylistic rules
- `eslint-local-plugin.js` — Custom rules (destructure-param-newline, padding)
- `.editorconfig` — Tab width 8, charset utf-8
- `.vscode/settings.json` — Format-on-save, ESLint integration
- `.vscode/extensions.json` — Recommends ESLint extension

#### Go
- `.golangci.yml` — Default linter set (errcheck, gosimple, govet, ineffassign, staticcheck, unused)
- `.editorconfig` — Tab width 8 (display hint; gofmt uses tabs)
- `.vscode/settings.json` — Format-on-save, golangci-lint integration
- `.vscode/extensions.json` — Recommends Go extension

#### Python
- `ruff.toml` — Ruff formatter + linter config
- `.editorconfig` — 4-space indent (PEP8), charset utf-8
- `.vscode/settings.json` — Format-on-save, Ruff integration
- `.vscode/extensions.json` — Recommends Ruff extension

### Style Rules

| Rule | JS/TS | Go | Python |
|------|-------|-----|--------|
| Indentation | Tabs (8-space display) | Tabs (8-space display) | 4 spaces |
| Line width | 999 | gofmt default | 999 |
| Braces | Allman | gofmt default | N/A |
| Quotes | Double | N/A | Double |
| Semicolons | Always | N/A | N/A |
| Trailing commas | All | N/A | N/A |

### Behavior

1. **Detect languages** — Scan repo for language markers
2. **Emit config files** — Copy templates for each detected language
3. **Overwrite existing** — Replace any existing config (deterministic, no merge)
4. **Emit shared files** — `.editorconfig` and `.vscode/` settings
5. **Scaffold conventions** — Ensure `CONTRIBUTING.md` and `AGENTS.md` carry retrieval naming, factory DI, and module structure (see [Part C](#part-c--scaffolding-into-a-repo))
6. **Git commit** — If in a git repo, auto-commit with `chore: add code style config for <languages>`
7. **Non-git warning** — If not a git repo, warn and skip commit

### Instructions (formatter / linter)

When invoked for bootstrap, perform these steps:

#### Step 1: Detect Languages

Check for language markers:

```
JS/TS: tsconfig.json OR package.json OR any .js/.ts/.jsx/.tsx file
Go: go.mod OR any .go file
Python: pyproject.toml OR requirements.txt OR any .py file
```

Report which languages were detected.

#### Step 2: Emit Config Files

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

#### Step 3: Document Dependencies

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

#### Step 4: Scaffold conventions docs

Follow [Part C](#part-c--scaffolding-into-a-repo) so `CONTRIBUTING.md` and `AGENTS.md` include the beyond-linting conventions. Do this even when only formatter configs were requested, if those docs are missing the sections.

#### Step 5: Git Commit (if applicable)

If the directory is a git repo:

1. Stage all changed/new config files (and CONTRIBUTING/AGENTS updates from Step 4)
2. Commit with message: `chore: add code style config for JS/TS, Go, Python` (list only detected languages)
3. Do NOT push

If not a git repo, warn: "Not a git repo. Skipping commit. Files have been written but are not version-controlled."

#### Step 6: Verify

Run a quick check to confirm tools work:

**JS/TS:** `npx eslint --max-warnings 0 .` (expect it to run, may report fixable issues)
**Go:** `golangci-lint run` (expect it to run)
**Python:** `ruff check .` (expect it to run)

Report success or any issues.

---

## Part B — Code-style conventions (beyond linting)

Contract and structure rules that linters do not enforce: **retrieval naming** (`get` / `find` / `list`), **factory DI** (`Make…`), and **backend module/folder structure**. Primarily for JS/TS.

### When to use these conventions

- Naming or reviewing functions that load one value or a collection
- Designing units that touch I/O, clocks, env, DB, or other side effects
- Laying out `src/modules/…` for a new backend (TypeScript modular monolith or similar)
- Adopting this guidance in a repo (see [Part C](#part-c--scaffolding-into-a-repo))

### Retrieval naming (`get` / `find` / `list`)

Use these verbs so callers can trust return types without reading the body.

**Failures:** throwing on hard errors (and on `get` when missing) is the accepted JS compromise here. Do not introduce Result/Either types for these contracts unless the repo already uses them.

#### Quick comparison

| Verb | Missing target | Return shape | Hard errors (DB down, bad input, auth, …) |
|------|----------------|--------------|-------------------------------------------|
| **get** | Fail (throw / error) | Always the value — never null / undefined / Option | May throw |
| **find** | Soft-fail | Absent value (`null`, `Option`, etc.) | May throw |
| **list** | Empty collection | Always a bag/array — never null / Option | May throw |

**Rule of thumb:** “I have a `User`” → `get`. “I might have a `User`” → `find`. “Zero or more `User`s” → `list`.

#### `get` — definitely there

- Contract: the thing **exists**. Callers may assume a real value.
- Must return the asked-for value — **never** null, undefined, Option/Maybe, or other absence.
- If missing → **throw**.

```typescript
function getUserById(id: string): User {
  const user = db.users.get(id);
  if (!user) throw new NotFoundError(`User ${id}`);
  return user;
}

// Wrong — name promises a value but type allows absence
function getUserById(id: string): User | null { ... }
```

#### `find` — maybe there

- Same lookup as `get`, but **missing is success with absence**.
- Soft-fail **only** for “not found.” Still throw on real failures.
- **JavaScript / TypeScript:** prefer `null` for not-found; avoid `undefined`.

```typescript
function findUserByEmail(email: string): User | null {
  return db.users.findByEmail(email) ?? null;
}
```

#### `list` — a bag of matches

- Always return a collection. No matches → **empty bag** (success).
- **Never** return null / Option for “nothing matched.”

```typescript
function listUsersByRole(role: Role): User[] {
  return db.users.filter({ role }); // [] if none
}
```

#### Other retrieval verbs

Prefer `get` / `find` / `list`. Avoid `fetch` / `load` / `resolve` unless the domain strongly needs that word and it is clearer than get/find/list.

#### Retrieval checklist

1. Must exist → `getX…` → non-nullable; throw if absent.
2. Optional → `findX…` → nullable / Option; JS/TS use `null`.
3. Many → `listX…` → collection; empty OK; never null.
4. Hard failures stay hard for all three (throw).

### Dependency injection (`Make…` factories)

Prefer **dependency injection** so units stay maintainable and testable. In JS/TS, use the **factory pattern**: a `Make…` function takes outside dependencies, does one-time setup, and returns the real function.

**Purity goal (FP framing):** not “no effects,” but **effects only through injected capabilities**. `Make…` is the impure shell (wire deps, run I/O); keep pure transforms as separate helpers when that clarifies the boundary.

**Failures:** throw on hard errors. That is intentional without a Result/Either library — do not push Result types for DI or retrieval.

#### What belongs in `deps`?

Pass into `Make…` only what comes from **outside** the pure unit. That is usually:

1. **Environment / config** — values supplied at the composition root (env map, secrets, URLs, feature flags). Pass them in as normal deps; do not wrap env lookup in `MakeFindEnv` / `MakeGetEnv`, and do not fall back to ambient `process.env` inside factories.
2. **Side effects** — capabilities that reach out (query/DB, HTTP, filesystem, email, queues).
3. **Non-determinism / time** — clocks, “today”, random IDs. Inject them so tests can pin behavior.

Keep **pure** domain logic and local values **inside** the returned function (or as pure helpers). Do **not** inject plain local data that has no external or setup cost.

#### Factory shape and examples

**Naming:** prefix with **`Make` + verb/domain** only (`MakeListParents`, `MakeIsExpired`, `MakeDb`). Align the verb with get/find/list when the returned function is a retrieval. Do not use `mk…` for new code.

**List + nested setup** — deps in, setup nested factories, return the list function:

```typescript
export function MakeDb(deps: { dbUrl: string }) {
  return openDatabase(deps.dbUrl);
}

export function MakeListParents(deps: { dbUrl: string }) {
  const db = MakeDb(deps); // setup / nested factory

  return (email: string): Promise<Parent[]> =>
    db.parents.where({ email }).toArray(); // [] if none
}
```

**Injected clock:**

```typescript
export function MakeIsExpired(deps: { now: () => Date }) {
  return (expiresAt: Date) => expiresAt.getTime() < deps.now().getTime();
}

// Wrong — wall clock hidden inside
export function MakeIsExpired() {
  return (expiresAt: Date) => expiresAt.getTime() < Date.now();
}
```

**Composition root** — pass env/config in as deps (no Make-env helper); wire `{ dbUrl }` into factories:

```typescript
export function MakeApp(env: NodeJS.ProcessEnv) {
  const dbUrl = env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is required");

  const deps = { dbUrl };
  const listParents = MakeListParents(deps);
  const isExpired = MakeIsExpired({ now: () => new Date() });
  // mount routes that call listParents / isExpired
  return app;
}

export function MakeTestApp() {
  return MakeApp({
    DATABASE_URL: "postgresql://user:pass@test.invalid/app",
  });
}
```

#### Composition

- Nested factories share the same deps bag; each pulls what it needs and builds children.
- Composition roots (app entry, route modules, tests) **construct** the deps bag and call factories once; request handlers call the **returned** functions.

#### Anti-patterns

```typescript
// Wrong — ambient process.env / I/O buried inside the unit
async function listParents(email: string) {
  const db = getDatabase(process.env.DATABASE_URL!);
  return db.parents.where({ email }).toArray();
}

// Wrong — wall clock hardcoded instead of injected
export function MakeListDueToday(deps: { queryDueOn: (d: Date) => Promise<Item[]> }) {
  return () => deps.queryDueOn(new Date());
}

// Wrong — module-level mutable client as an implicit global
let db: Database;
export function listParents(email: string) {
  return db.parents.where({ email }).toArray();
}
```

### Module / folder structure (backends)

**Scope:** **new backends** (TypeScript modular monolith or similar). Do **not** apply `src/modules/…` domain folders inside frontend `apps/*/src` unless a separate frontend convention says so.

Organize application code by **durable system components (domains)**, not by technical layer at the top of `src/`.

A module is a **main part of the system architecture** — stable over time — not a sprint ticket, weekly “feature,” or feature-flag slice. Think of an online shop: modules like **`order`** and **`billing`** (the domains the system is built from), not folders named after this week’s campaign or ticket.

- Domain folders live under **`src/modules/<name>/`**.
- Folder names are **kebab-case singular** domain nouns (e.g. `order`, `billing`). Prefer singular for **new** modules even if an older repo used plurals historically.
- Each module owns the pieces for that domain (HTTP surface, persistence, API schemas). Cross-cutting wiring and shared utilities stay **outside** modules.
- Prefer one module per **real domain boundary** (own routes and/or data). Do not create a new module for a short-lived work item. When a domain grows large, **nest with subfolders** inside that module.

#### Top-level layout (relative to modules)

Typical `src/` shape:

| Area | Role |
|------|------|
| **`src/modules/`** | System domains / components (`order`, `billing`, …) |
| **`src/lib/`** | Shared app utilities & cross-cutting middleware |
| **`src/db/`** | Database client, migrations, seed, DB types |
| **`src/env.ts`** | Environment access at the composition boundary |
| **`src/app.ts`** | Composition root — mount middleware & module routes |
| **`src/index.ts`** | Process entry (listen, shutdown) |

Repo root may also hold `test/`, `infra/`, `docs/`, tooling configs — those are not domain modules.

#### Inside a module

Files are named **`<name>.<role>.ts`**, matching the folder name (at the module root). Roles:

| Role | File | Responsibility |
|------|------|----------------|
| **Routes** | `<name>.routes.ts` | OpenAPI/HTTP route factories (`Make…Routes`); thin handlers that call repository (or service) factories |
| **Repository** | `<name>.repository.ts` | Data-access factories (`MakeList…`, `Make…Query`, etc.); domain row types often live here |
| **Schemas** | `<name>.schemas.ts` | Zod / OpenAPI request & response schemas for that module’s API |
| **Services** (optional) | e.g. `<name>.service.ts` or under a subfolder | Domain/orchestration between routes and repositories — **add when needed**, not by default |

**Not every module needs every role.**

- Routes + repository + schemas — typical API domain (e.g. `order`, `billing`).
- Routes + schemas, no repository — pure/status endpoints (e.g. `health`).
- Small helpers shared by several modules (no full HTTP domain of their own) → **`src/lib/`**, not a dedicated `src/modules/…` folder.

**How pieces connect**

1. **Composition root** (`src/app.ts`) builds shared deps (e.g. `dbUrl` from env) and mounts module routes (`MakeOrderRoutes(args)`, …).
2. **Routes factory** constructs repository (and, when present, service) factories once, registers OpenAPI routes, and returns a sub-app.
3. **Repository factory** takes injected deps, sets up DB (via shared `MakeDb`), returns the callable used by handlers or services.

**Default call path:** routes → repository. A **services layer may be added when needed** for orchestration or non-trivial domain logic; do not invent it for every module.

Factories follow this skill’s DI naming (`Make…`). Retrieval verbs on repositories follow `get` / `find` / `list`.

#### Shared vs module-local

**Put in the module** when it belongs to that domain: that domain’s routes, queries, and response/request schemas; types only that module (or a tightly coupled sibling) needs.

**Put in shared locations** when multiple modules or the whole app need it:

| Kind | Where |
|------|-------|
| Auth, logging, OpenAPI helpers, DI types, shared Zod primitives | `src/lib/` |
| Small shared domain helpers used by multiple modules (no own HTTP surface) | `src/lib/` |
| Env binding | `src/env.ts` (src root) |
| DB connection / migrations / generated DB types | `src/db/` |
| App-wide middleware that may call a module | still `src/lib/`, importing the module |

**Cross-module imports are allowed** when one domain genuinely depends on another module’s public API (prefer the module barrel). For a small helper several modules need, put it in **`src/lib/`** rather than inventing a module with no routes.

#### Nesting & barrels

- **Nesting:** Start shallow (role files at the module root). When a domain grows, **prefer nested subfolders** inside that module rather than flat sibling files only or premature split into new top-level modules.
- **Barrels:** Module `index.ts` barrels are **good** — use them as the public façade (and for nested subfolders when useful). Outside code should prefer importing from the barrel rather than deep private paths when a barrel exists.

#### Tests relative to modules

**Keep tests outside modules** — top-level `test/` (or equivalent), not co-located `__tests__` beside module source:

- Broad API / schema / health tests at `test/*.test.ts`
- Shared fakes / `MakeTestApp` in `test/helpers.ts`
- Heavier DB work under `test/integration/`

#### Module structure checklist

**Do**

- For **new backends**, use `src/modules/<singular-kebab>/` with `<name>.routes.ts` / `.repository.ts` / `.schemas.ts` as needed (e.g. `order`, `billing`).
- Keep handlers thin; put SQL / persistence in the module repository factories.
- Add a services layer **only when** the domain needs orchestration beyond thin routes → repository.
- When a module grows, nest with **subfolders**; expose a deliberate **`index.ts` barrel**.
- Wire new routes from the composition root (`src/app.ts`).
- Share truly cross-cutting helpers and multi-module domain helpers via `src/lib/` (or `src/db/` / `src/env.ts` when they belong there).
- Put tests under top-level `test/`, not inside `src/modules/`.

**Don’t**

- Apply this module layout to frontend apps by default (backend-only convention).
- Create top-level `src/routes/`, `src/repositories/`, `src/services/` that slice *across* all domains.
- Create modules for sprint tickets, feature flags, or temporary experiments — only for durable architecture parts.
- Create a repository-only `src/modules/…` just to share a small helper — use `src/lib/` instead.
- Dump code that belongs to a **single** domain into `src/lib/` “for convenience.”
- Put process env reads or raw DB client setup inside every module — inject via factories / composition root.
- Force a services layer on every module.
- Prefer plural folder names for new modules (`orders`) when a singular domain noun fits (`order`).

---

## Part C — Scaffolding into a repo

When using this skill to adopt or scaffold code-style guidance:

1. Emit formatter/linter configs for detected languages (Part A), when bootstrap is in scope.
2. Ensure `CONTRIBUTING.md` exists (create it if missing).
3. Add **all** convention sections to `CONTRIBUTING.md` — retrieval naming, factory DI, and module structure (paste/adapt [templates/contributing-section.md](templates/contributing-section.md)).
4. Create or update `AGENTS.md` so agents are pointed at those CONTRIBUTING sections (paste/adapt [templates/agents-mention.md](templates/agents-mention.md)).

Do not leave the conventions only in a skill file or chat — they must live in-repo where humans and agents both find them.
