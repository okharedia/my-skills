## Code style — retrieval naming, factory DI, and modules

Follow **CONTRIBUTING.md** for:

1. **Retrieval function naming (`get` / `find` / `list`)**
2. **Factory dependency injection (`Make…`)**
3. **Module / folder structure (backends)** — `src/modules/<singular-kebab>/`

### Retrieval (summary)

- **`get`** — must return the value; throw if missing; never null/undefined/Option.
- **`find`** — may return absence; prefer `null` in JS/TS for not-found; still throw on hard errors.
- **`list`** — always a collection; empty if none; never null/Option.
- Prefer these three over `fetch` / `load` / `resolve` unless the domain clearly requires another verb.
- Failure-as-throw is OK here; do not introduce Result/Either unless the repo already uses them.

### Factory DI (summary)

- Effects only through **injected capabilities**; `Make…` is the impure shell; keep pure transforms separate when helpful.
- Inject **env/config** (as a normal deps value from the composition root), **side effects**, and **time/non-determinism**. Do not use `MakeFindEnv` / `MakeGetEnv` or ambient `process.env` / `new Date()` inside factories.
- Use **`Make…` factories** only (`MakeListOrders`, `MakeIsExpired`, …). Do not use `mk…` for new code.
- Align factory verbs with get/find/list when the returned function is a retrieval.
- Tests and composition roots supply the deps bag (env map → `dbUrl`, fixed `now`, …).

### Modules (summary)

- **Backend only** for new work: durable domains under `src/modules/` (e.g. `order`, `billing`), not sprint features.
- Prefer **singular** kebab-case folder names; grow with **subfolders**; **`index.ts` barrels OK**.
- Roles as needed: `.routes` / `.repository` / `.schemas`; **services optional**.
- Small shared helpers (no full domain) → `src/lib/`. Tests stay in top-level `test/`.

If those CONTRIBUTING sections are missing, create or update `CONTRIBUTING.md` with them before relying on ad-hoc naming, DI, or layout.
