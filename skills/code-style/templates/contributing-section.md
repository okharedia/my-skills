## Retrieval function naming (`get` / `find` / `list`)

Name accessors so the return contract is obvious from the verb. This is independent of formatter/linter rules.

Throwing on hard errors (and on `get` when missing) is the accepted JS compromise — do not introduce Result/Either for these contracts unless the repo already uses them.

### Comparison

| Verb | When the target is missing | Return |
|------|----------------------------|--------|
| `get` | Fail (throw) | Always the value — never null, undefined, or Option |
| `find` | Soft-fail | Absent representation (`null`, Option, etc.) |
| `list` | Empty collection | Always a bag — never null or Option |

Hard failures (DB down, invalid input, permission denied, …) may still throw for all three. Soft-fail only means “the asked-for thing isn’t there.”

### `get`

Use when the thing is **definitely there** under this function’s contract. Callers can rely on a real value. If it is missing, throw — do not return absence.

### `find`

Like `get`, but missing is allowed. Return the language’s usual absent value. In **JavaScript / TypeScript**, prefer `null` for not-found; avoid `undefined`.

### `list`

Return a collection of matches. No matches → empty collection (success). Do not return null or Option for an empty result.

### Other retrieval verbs

Avoid `fetch`, `load`, `resolve`, and similar unless the domain strongly needs that word and the meaning is clearer than `get` / `find` / `list`.

### Examples (TypeScript)

```typescript
function getUserById(id: string): User {
  const user = db.users.get(id);
  if (!user) throw new NotFoundError(`User ${id}`);
  return user;
}

function findUserByEmail(email: string): User | null {
  return db.users.findByEmail(email) ?? null;
}

function listUsersByRole(role: Role): User[] {
  return db.users.filter({ role }); // [] if none
}
```

## Factory dependency injection (`Make…`)

Prefer dependency injection for maintainability and testability. In JS/TS, use the **factory pattern**.

**Purity:** not “no effects,” but effects only through **injected capabilities**. `Make…` is the impure shell; keep pure transforms as separate helpers when helpful. Throw on hard errors (no Result/Either required).

### Rules

- Put in `deps` what comes from outside: **env/config** (passed in at the composition root), **side effects** (query/DB, HTTP, fs, …), and **non-determinism/time** (clocks, random IDs). Keep pure domain logic inside — do not inject plain local values with no external cost.
- Pass env/config as normal deps. Do not add `MakeFindEnv` / `MakeGetEnv`, and do not read ambient `process.env` or call `new Date()` deep inside factories.
- Name factories **`Make` + verb/domain** only (e.g. `MakeListParents`, `MakeIsExpired`). Do not use `mk…` for new code.
- Factory signature: take a deps bag → setup → **return** the function callers use.
- Composition roots build the deps bag once; request paths call the returned functions.

### Examples

```typescript
export function MakeDb(deps: { dbUrl: string }) {
  return openDatabase(deps.dbUrl);
}

export function MakeListParents(deps: { dbUrl: string }) {
  const db = MakeDb(deps); // setup / nested factory

  return (email: string): Promise<Parent[]> =>
    db.parents.where({ email }).toArray(); // [] if none
}

export function MakeIsExpired(deps: { now: () => Date }) {
  return (expiresAt: Date) => expiresAt.getTime() < deps.now().getTime();
}

// Wrong — wall clock hidden inside
export function MakeIsExpired() {
  return (expiresAt: Date) => expiresAt.getTime() < Date.now();
}

// Composition root — env → { dbUrl } into factories
export function MakeApp(env: NodeJS.ProcessEnv) {
  const dbUrl = env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is required");
  const listParents = MakeListParents({ dbUrl });
  const isExpired = MakeIsExpired({ now: () => new Date() });
  return { listParents, isExpired };
}

// Anti-pattern — ambient env and wall clock buried inside
async function listDueItems() {
  const db = getDatabase(process.env.DATABASE_URL!);
  return db.items.where({ dueBefore: new Date() }).toArray();
}
```

Wire fake deps in tests (fixed `now`, non-production `dbUrl` / env map) instead of ambient env, wall clock, or shared mutable module state.

## Module / folder structure (backends)

**Scope:** **new backends** (TypeScript modular monolith or similar). Do not apply `src/modules/…` inside frontend apps unless a separate frontend convention says so.

Organize by **durable system domains**, not by technical layer at the top of `src/`, and not by sprint tickets or short-lived features. Shop example: modules like `order` and `billing`.

### Layout

| Area | Role |
|------|------|
| `src/modules/<name>/` | Domain modules — **singular** kebab-case folder names for new work |
| `src/lib/` | Shared utilities, cross-cutting middleware, small multi-module helpers (no full domain) |
| `src/db/` | DB client, migrations, seed, generated DB types |
| `src/env.ts` / `src/app.ts` / `src/index.ts` | Env boundary, composition root, process entry |

### Inside a module

Name files `<name>.<role>.ts` as needed:

| Role | File | Notes |
|------|------|-------|
| Routes | `<name>.routes.ts` | Thin HTTP/OpenAPI handlers; call repository (or service) factories |
| Repository | `<name>.repository.ts` | Data-access factories; retrieval verbs follow get/find/list |
| Schemas | `<name>.schemas.ts` | Request/response schemas for that module’s API |
| Services | optional | Add only when orchestration beyond routes → repository is needed |

Not every module needs every role (e.g. a `health` module may be routes + schemas only).

### Growth, barrels, tests

- When a domain grows, **nest with subfolders** inside the module — do not split into new top-level modules prematurely.
- **`index.ts` barrels are good** — prefer importing the module façade over deep private paths.
- Keep tests in top-level **`test/`**, not co-located under `src/modules/`.

### Do / don’t (short)

**Do:** one module per durable domain; wire routes from `src/app.ts`; share cross-cutting helpers via `src/lib/`; use `Make…` factories and get/find/list on repositories.

**Don’t:** top-level `src/routes/` / `src/repositories/` / `src/services/` across all domains; modules for tickets/feature flags; repository-only modules just to share a helper (use `src/lib/`); force a services layer everywhere; plural folder names for new modules when a singular noun fits (`order`, not `orders`).
