# Effect v4: research notes for a beginner course

Researched 2026-10-01. Everything below was checked against primary sources: the `Effect-TS/effect` repo at tag `effect@4.0.0`, effect.website v4 docs, the 4.0 release post, and the npm registry. Every code snippet was **typechecked and run against `effect@4.0.0`**. The snippets are in [`./snippets/src/`](./snippets/src/), and [`./snippets/package.json`](./snippets/package.json) pins the exact versions.

**Test environment:** `effect@4.0.0`, `@effect/platform-node@4.0.0`, `@effect/vitest@4.0.0` + `vitest@5.0.3`, TypeScript `7.0.2` (also passes with `5.9.3`), Node `v22.23.2`, `tsx@4.23.15`. Every `src/0*.ts` file also runs under plain `node src/<file>.ts`, because Node 22.18+ can strip TypeScript types.

**Citation shorthand**

- `REPO` = `https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d`. This is the commit that tag `effect@4.0.0` points to, "Version Packages (#8577)", 2026-09-30.
- `DOCS` = `https://effect.website/docs/v4`. Every docs page is also served as raw Markdown if you append `.md`, e.g. `DOCS/getting-started/the-effect-type.md`.

---

## 0. Release status & install

### Status (as of 2026-10-01)

- **Effect 4.0.0 is stable and on npm `latest`.** dist-tags: `latest: 4.0.0`, `rc: 4.0.0-rc.118`, `beta: 4.0.0-beta.107`. `4.0.0` was published 2026-10-01T03:11Z. The last v3 release is `3.22.2` (2026-09-09). Source: `npm view effect dist-tags time`.
- The pre-release history ran from many `4.0.0-beta.N` versions, to `4.0.0-rc.108` (2026-08-12), to `rc.118` (2026-09-28), to `4.0.0`. Source: npm `time` field.
- The release post is "Effect 4.0" by Sebastian Lorenz, dated Sep 30, 2026: https://effect.website/blog/releases/effect/40. It says the release was "Rebuilt from the ground up, with a dependency-free core and long-term support."
- **Effect 4.x is an LTS release.** It gets "At least three years of support", with bug fixes for one year and security fixes for two years after the next major ships ([REPO/README.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/README.md)). The blog gives the dates: bug fixes until Sept 2029, or one year after 5.0, whichever is later. Security fixes until Sept 2029, or two years after 5.0.
- **Where the code lives now.** v4 was developed in `Effect-TS/effect-smol`, which is now archived. Its README says "Effect V4 Has Moved … The complete V4 Git history has been merged into the canonical `effect` repository" (effect-smol `README.md`, commit `3a1128c`, 2026-07-14). Today:
  - v4 lives on `Effect-TS/effect` `main`.
  - v3 lives on branch [`v3`](https://github.com/Effect-TS/effect/tree/v3).
  - Old effect-smol links and blog posts that mention `effect-smol` are historical.
- **Performance claims** (blog, "Bundles are built from identical source, minified and gzipped. Runtime figures are medians of nine fresh-process runs"):

  | Metric | v3 | v4 |
  |---|---|---|
  | Minimal program size | 35.6 kB | 7.1 kB |
  | Tasks per second | 0.71M | 4.57M |
  | Heap for 50,000 fibers | 157.5 MB | 21.8 MB |

  [REPO/MIGRATION.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/MIGRATION.md) gives slightly different sizes: "~6.3 KB (minified + gzipped). With Schema, ~15 KB." The two sources disagree a little; report it as "about 6–7 kB".
- **Zero runtime dependencies.** The core package has none (blog: "The core `effect` package has zero runtime dependencies"). The published `effect@4.0.0/package.json` has no `dependencies` field (verified locally).

### Stability tiers (important for course scope)

`@stability unstable` means an API may break in **minor** releases. `@stability experimental` means it may break in **patch** releases. Anything without a tag follows strict semver.

These modules are unstable: `ai, cli, cluster, devtools, eventlog, http, http-api, jsonschema, observability, persistence, process, reactivity, rpc, schema, socket, sql, workflow, workers`. They are imported as `effect/<module>`. The old `effect/unstable/<module>` paths are gone ([REPO/MIGRATION.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/MIGRATION.md) "Unstable Module System").

The modules a beginner course uses (`Effect`, `Layer`, `Context`, `Data`, `Schedule`, …) carry no `@stability` tag, so they are stable. `grep -c '@stability'` over `Effect.ts`, `Layer.ts` and `Context.ts` returns 0. `Schema.ts` has about 120 tagged items, so a few advanced Schema APIs are unstable.

> Note: the **`Schema` module** (`import { Schema } from "effect"`) is core. The **`effect/schema` subpath** is something else: it holds `Model`, `VariantSchema` and the Schema compilers, and that subpath is unstable (`packages/effect/src/schema/`).

### Requirements

| Requirement | README | Website install page |
|---|---|---|
| TypeScript | 5.9 or newer; TypeScript 7 recommended | same |
| `strict: true` in tsconfig | required | required |
| Node.js | 18+ as the general minimum | Node.js 22.18+, Deno or Bun |

Sources: [REPO/README.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/README.md) "Requirements" and `DOCS/getting-started/installation`.

The two sources disagree on Node. The website's 22.18 figure comes from running `.ts` files directly with `node`. For the course, say **Node 22.18+**.

### Install (from `DOCS/getting-started/installation`)

```sh
mkdir hello-effect && cd hello-effect
npm init -y                       # then add "type": "module" to package.json
npm install --save-dev typescript
npx tsc --init                    # make sure "strict": true
npm install effect
node src/index.ts                 # Node >= 22.18 runs .ts directly; older Node: npx tsx src/index.ts
```

Optional extras:

- `@effect/platform-node`, for `NodeRuntime.runMain`.
- `@effect/vitest`, for tests.
- `@effect/tsgo`, the Effect LSP/diagnostics, installed with `npx @effect/tsgo setup`. It needs TypeScript 7 (`DOCS/getting-started/devtools`).

All `@effect/*` packages now share the core version (`effect@4.0.0` ↔ `@effect/platform-node@4.0.0`) and must be bumped together ([REPO/MIGRATION.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/MIGRATION.md) "Versioning"). `@effect/vitest@4.0.0` has the peer dependency `vitest >=5.0.0 <6.0.0` (npm).

---

## Lesson 1: Mental model: `Effect<A, E, R>`

**Key facts**

- "The `Effect` type is a description of a workflow or operation that is **lazily** executed … when you create an `Effect`, it doesn't run immediately" (`DOCS/getting-started/the-effect-type`).
- Effects are immutable values that "do not perform any actions themselves". They are executed by the runtime, "ideally … at a single entry point in your application" (same page).
- Declaration: `export interface Effect<out A, out E = never, out R = never>`. **E and R default to `never`**, so `Effect.Effect<number>` means "a number, cannot fail, needs nothing" ([REPO/packages/effect/src/Effect.ts#L116](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L116)).
- The three parameters (`DOCS/getting-started/the-effect-type`):
  - **A / Success**: the value it succeeds with. `void` means no useful value; `never` means it runs forever.
  - **E / Error**: the *expected* errors. `never` means it cannot fail.
  - **R / Requirements**: the services it needs. `never` means none.
- Mental model the docs offer: think of it as `(context: Context<R>) => E | A`, "However, effects are not actually functions."
- Type extractors: `Effect.Success<T>`, `Effect.Error<T>`, `Effect.Services<T>`. **v4 renamed `Effect.Context<T>` to `Effect.Services<T>`** ([REPO/migration/v3-to-v4.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/v3-to-v4.md) `effect/Effect` section: "`Effect.Effect.Context` -> `Effect.Services`").
- Running at the edge (`DOCS/getting-started/running-effects`):
  - `Effect.runSync` is sync only. On an async effect it throws `AsyncFiberError: An asynchronous Effect was executed with Effect.runSync` (observed).
  - `Effect.runPromise` returns a Promise.
  - `Effect.runSyncExit` / `Effect.runPromiseExit` never throw; they return an `Exit`.
  - `Effect.runFork` returns a `Fiber`.
  - These all require `R = never`.
- **v4 behaviour:** `runPromise` / `runSync` now reject or throw with the **raw error** (`Cause.squash`), e.g. the string `"nope"` itself. v3 wrapped it in `FiberFailure`. Sources: [REPO/migration/v3-to-v4.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/v3-to-v4.md) lines ~13518–13548: "`Runtime.FiberFailure` -> `none`: The runner error wrapper was removed", "`Runtime.makeFiberFailure` -> `Cause.squash`". `REPO/packages/effect/src/internal/effect.ts` (`causeSquash`). Observed in a test run.
- **For Node apps, use `NodeRuntime.runMain`** from `@effect/platform-node`. It gives SIGINT/SIGTERM handling with graceful interruption, exit codes, and error reporting ([REPO/migration/fiber-keep-alive.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/fiber-keep-alive.md)). v4's core runtime now keeps the process alive while fibers wait, which v3 needed `runMain` for, but `runMain` "is still the recommended way" (same file).

**Verified snippet: lazy vs eager** (`snippets/src/01-lazy-vs-promise.ts`)

```ts
import { Effect } from "effect"

const promise = new Promise<number>((resolve) => {
  console.log("Promise body runs immediately")
  resolve(1)
})

const effect = Effect.sync(() => {
  console.log("Effect body runs only when the Effect is run")
  return 1
})

console.log("--- nothing has run the Effect yet ---")

const a = Effect.runSync(effect) // runs it once
const b = Effect.runSync(effect) // runs it again: an Effect is a reusable recipe
console.log(a + b) // 2

await promise
```

Output: `Promise body runs immediately`, then `--- nothing has run…`, then the Effect line **twice**, then `2`.

**Verified snippet: the inferred type** (`snippets/src/01-effect-type.ts`, compile-time asserted with an `Expect<Equal<…>>` helper)

```ts
import { Context, Effect } from "effect"

class Clock extends Context.Service<Clock, { readonly now: Effect.Effect<number> }>()("app/Clock") {}

const one = Effect.succeed(1)   // Effect<number, never, never>
const oops = Effect.fail("boom") // Effect<never, string, never>
const time = Effect.gen(function*() { // Effect<number, never, Clock>
  const clock = yield* Clock
  return yield* clock.now
})
// Effect.runSync(time) // <- type error: R must be never to run
const runnable = time.pipe(Effect.provideService(Clock, { now: Effect.succeed(42) }))
console.log(Effect.runSync(runnable)) // 42
```

Also see `01-running.ts` (all the `run*` variants) and `01-run-main.ts` (`NodeRuntime.runMain`).

---

## Lesson 2: Why Effect instead of plain TypeScript

**The pitch, from official sources**

- "TypeScript is excellent at describing your data, but it says almost nothing about your programs: a function's signature doesn't tell you what can fail, what dependencies it needs, or whether it can be safely retried, timed out, or interrupted" (`DOCS/onboarding`).
- "Because programs are values, they compose: retries, timeouts, concurrency, resource handling, and tracing are operators you apply, not architectures you rebuild" (`DOCS/onboarding`).
- "Effect's major unique insight is that we can use the type system to track **errors** and **context**, not only **success** values" (`DOCS/getting-started/why-effect`).
- The docs list what you get out of the box (`DOCS/onboarding`): typed errors, retries/scheduling, structured concurrency, resource safety, DI, observability, streaming, schema validation, configuration, and an ecosystem covering HTTP, SQL, CLI, AI and platform.
- "Built for the AI era": the type system makes failure modes and dependencies visible to the compiler and to coding agents (`DOCS/onboarding`). This is the project's own framing.

**Problems it solves, mapped to course lessons**

| Plain-TS pain | Effect answer | Lesson / snippet |
|---|---|---|
| `throw` is invisible in signatures; `catch (e)` gives `unknown` | `E` channel, tagged errors, `catchTag` removes handled errors from the type | `02-typed-errors-vs-throw.ts`, L4 |
| Passing dependencies by hand, or global singletons that are hard to mock | `R` channel + services + Layers; swap a layer in tests | L5 |
| Promises are eager and cannot be cancelled | Lazy Effects, interruption, `Effect.timeout` interrupts the work and runs cleanup | `02-interruption-timeout.ts` |
| `Promise.all` has no concurrency limit and doesn't cancel siblings on failure | `Effect.all(..., { concurrency: n })`; siblings are interrupted when one fails | `06-concurrency.ts`, `06-race-and-structured.ts` |
| `try/finally` resource leaks across async boundaries | `acquireRelease` + `Scope`: release runs on success, failure or interruption | `06-acquire-release.ts` |
| Hand-written retry loops | `Effect.retry` + composable `Schedule` | `06-retry-schedule.ts` |
| Ad-hoc logging and tracing | `Effect.log*`, `Effect.fn("name")` spans, OTLP exporters | `07-logging-tracing.ts` |

**Verified snippet: interruption, which Promises can't do** (`snippets/src/02-interruption-timeout.ts`)

```ts
import { Effect } from "effect"

const slowTask = Effect.gen(function*() {
  yield* Effect.log("task started")
  yield* Effect.sleep("2 seconds")
  yield* Effect.log("task finished") // never printed: the task is interrupted
  return "result"
}).pipe(Effect.onInterrupt(() => Effect.log("task interrupted, cleanup ran")))

const program = slowTask.pipe(
  Effect.timeout("100 millis"), // fails with Cause.TimeoutError and interrupts slowTask
  Effect.catchTag("TimeoutError", () => Effect.succeed("fallback"))
)
console.log(await Effect.runPromise(program)) // "fallback" (after ~100ms, cleanup log printed)
```

**Honest trade-offs and costs**

- **Learning curve and API surface.** The official Myths page admits the ecosystem is large. It recommends starting with "10–20 core functions" (https://effect.website/myths/). ⚠️ The Myths page has **not been updated for v4**: its starter list still shows `Effect.catchAll` and `Either`, which are v3 names. Don't copy it verbatim.
- **Bundle cost.** About 6–7 kB gzipped for a minimal program, about 15 kB with Schema (MIGRATION.md / blog). That is small but not zero. The Myths page's "~25KB" figure is from v3.
- **Performance overhead in micro-benchmarks.** The Myths page says the "500x slower" claim "only applies when measuring trivial operations like 1 + 1". Effect is "an app-level coordination library rather than a low-level operation wrapper."
- **Unstable surface beyond core.** HTTP, SQL, AI, CLI, RPC and similar modules are `@stability unstable` and can break in minor releases (MIGRATION.md). The 4.0 blog says stabilising them is the "first priority".
- **Major-version churn.** v3 tutorials, Stack Overflow answers and LLM training data use renamed APIs. See the cheat list below. This is a real cost for learners.
- **Type-inference sharp edges** (observed in this research):
  - A function that returns different Effects from ternary branches infers a *union of Effect types*, which then fails in `.pipe(Effect.catchTag(...))`. Fix it by annotating the return type `: Effect.Effect<A, E>`. The official "why effect" example does this too.
  - `Effect.andThen` / `Effect.tap` no longer accept plain values in v4 (see L3).
- **Ecosystem lock-in and "Effect all the way".** Effect code composes best with other Effect code. You call it from non-Effect code at the edges with `runPromise` / `ManagedRuntime` (LLMS.md "Integrating Effect into existing applications"). UNVERIFIED as an official statement of cost; this is community wisdom.

---

## Lesson 3: Building programs

**Constructors** (`DOCS/getting-started/creating-effects`; [REPO/ai-docs/src/01_effect/01_basics/10_creating-effects.ts](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/ai-docs/src/01_effect/01_basics/10_creating-effects.ts))

| Constructor | Use for |
|---|---|
| `Effect.succeed(a)` | A value you already have |
| `Effect.fail(e)` | An expected failure (`Effect.failSync` for a lazily built error) |
| `Effect.sync(() => …)` | A sync side effect that will not throw. If it does throw, that is a **defect** |
| `Effect.try({ try, catch })` | Sync code that may throw, mapped to a typed error. There is also a callback-only overload that fails with `Cause.UnknownError` (v3-to-v4.md: "`Effect.try` … Use the callback overload for Cause.UnknownError, or the object overload with try and catch to map failures to a custom error") |
| `Effect.tryPromise({ try, catch })` | A Promise that may reject ([Effect.ts#L966](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L966)) |
| `Effect.promise(() => p)` | A Promise that never rejects ([#L892](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L892)) |
| `Effect.callback(resume => …)` | Callback-style APIs. **v3 `Effect.async` was renamed `Effect.callback`** (v3-to-v4.md) |
| `Effect.fromNullishOr(x)` | Nullable values. v3 `Effect.fromNullable` is gone: "`Effect.fromNullable` -> `Effect.fromOption + Option.fromNullable`" (v3-to-v4.md). `fromNullishOr` exists at [#L1942](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L1942) |

**Style guidance from the maintainers** ([REPO/LLMS.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/LLMS.md))

- "Prefer `Effect.gen` for inline Effect code. For reusable functions, prefer `Effect.fn("name")` when tracing is useful and `Effect.fnUntraced` when it is not."
- "Avoid functions that only wrap and return `Effect.gen`."
- With `Effect.fn`, pass extra combinators as extra arguments: "**Do not** use .pipe with Effect.fn."
- When failing in a generator, `return yield* new MyError(...)` "to ensure typescript understands that the function will not continue executing".
- `Effect.fn.Return<A, E, R>` annotates a generator's return type. In v3 this was `Effect.fn.Gen` ("`Effect.fn.Gen` -> `Effect.fn.Return`", v3-to-v4.md).
- `Effect.gen` with `this`: v4 uses `Effect.gen({ self: this }, function*() {…})` ([REPO/migration/generators.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/generators.md)).

**`andThen` / `tap` changed in v4 (verified)**

In v4, `Effect.andThen` and `Effect.tap` accept **only an Effect, or a function returning an Effect**. Signatures: [Effect.ts#L2138](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L2138) (`andThen`) and [#L2206](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L2206) (`tap`).

In v3, both also accepted plain values, plain-returning functions and Promises. See v3 branch `packages/effect/src/Effect.ts`, `andThen` overloads `f: (a) => X` with `[X] extends [PromiseLike…]`, at commit `b57b7f6e`.

So in v4, `Effect.andThen((n) => n + 1)` and `Effect.tap((n) => console.log(n))` are **type errors**. At runtime the second one crashes with `Not a valid effect: undefined` (observed). Use `Effect.map` for pure transforms. ⚠️ v3-to-v4.md does **not** call this out explicitly. It is easy to trip over with old tutorials.

**Verified snippet: `Effect.gen`** (`snippets/src/03-gen.ts`)

```ts
import { Data, Effect } from "effect"

class NotFound extends Data.TaggedError("NotFound")<{ readonly id: number }> {}

const findUser = (id: number) =>
  id === 1 ? Effect.succeed({ id, name: "Ada" }) : Effect.fail(new NotFound({ id }))
const getAge = (_name: string) => Effect.succeed(36)

const program = Effect.gen(function*() {
  const user = yield* findUser(1) // like `await`
  const age = yield* getAge(user.name)
  if (age < 18) {
    return yield* new NotFound({ id: user.id }) // yield a tagged error to fail
  }
  return `${user.name} is ${age}`
}) // inferred: Effect<string, NotFound, never>  (asserted at compile time)
```

**Verified snippet: pipe / map / flatMap / tap / andThen** (`snippets/src/03-pipe.ts`)

```ts
import { Effect, pipe } from "effect"

const double = (n: number) => n * 2
const half = (n: number) => (n % 2 === 0 ? Effect.succeed(n / 2) : Effect.fail(`odd: ${n}`))

const a = Effect.succeed(10).pipe(
  Effect.map(double),                           // pure function
  Effect.flatMap(half),                         // Effect-returning function
  Effect.tap((n) => Effect.log(`got ${n}`)),    // side effect, keeps the value (must return an Effect in v4)
  Effect.andThen((n) => Effect.succeed(n + 1))  // v4: Effect or fn returning Effect only
)
const b = pipe(Effect.succeed(10), Effect.map(double), Effect.flatMap(half))
console.log(Effect.runSync(a), Effect.runSync(b)) // 11 10
```

**Verified snippet: `Effect.fn`** (`snippets/src/03-fn.ts`)

```ts
import { Data, Effect } from "effect"

class InvalidAmount extends Data.TaggedError("InvalidAmount")<{ readonly amount: number }> {}

export const withdraw = Effect.fn("withdraw")(function*(balance: number, amount: number) {
  if (amount <= 0 || amount > balance) return yield* new InvalidAmount({ amount })
  yield* Effect.log(`withdrawing ${amount}`)
  return balance - amount
}) // (balance, amount) => Effect<number, InvalidAmount, never>

export const withdrawOrZero = Effect.fn("withdrawOrZero")(
  function*(balance: number, amount: number) { return yield* withdraw(balance, amount) },
  Effect.catchTag("InvalidAmount", () => Effect.succeed(0)) // extra args = pipeable combinators
)
```

`03-constructors.ts` covers `succeed`, `fail`, `sync`, `try` and `tryPromise`, run end-to-end.

---

## Lesson 4: Error handling

**Two kinds of errors** (`DOCS/error-management/two-error-types`)

- **Expected errors** (failures, typed errors) live in `E`. You recover from them with `Effect.catch` / `Effect.catchTag`.
- **Defects** (unexpected errors) are "not tracked in the `Effect` error channel" but are kept in the `Cause`. They come from `Effect.die`, from exceptions thrown inside `Effect.sync`/`map`/etc., and from `Effect.orDie` (`DOCS/error-management/unexpected-errors`).
- "Defects usually should not be recovered from inside domain logic." Handle them at boundaries with `Effect.exit`, `Effect.catchDefect` or `Effect.catchCause`.

**Defining errors: both styles exist in v4**

- **`Data.TaggedError("Tag")<{ fields }>`**. This is what the website docs use (`DOCS/error-management/expected-errors`, `DOCS/error-management/yieldable-errors`; [REPO/packages/effect/src/Data.ts#L761](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Data.ts#L761)).
- **`Schema.TaggedError<Self>()("Tag", { field: Schema.X })`**. This is a schema-backed, serializable error. It is used **everywhere in the maintainers' LLMS.md and ai-docs** ("Use Schema.TaggedError to define a custom error"; [REPO/packages/effect/src/Schema.ts#L15151](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Schema.ts#L15151), "Defines a schema-backed yieldable error class with an automatically populated `_tag` field").
- `Data.Error` / `Schema.Error` are the untagged variants.
- Both are **yieldable**: `yield* new MyError(...)` inside a generator is the same as `Effect.fail(...)` (`DOCS/error-management/yieldable-errors`).
- Gotcha: "Tags Must Be Unique". Two classes with the same `_tag` are indistinguishable to `catchTag`, and nothing warns you (same page).
- Course recommendation: teach `Data.TaggedError` first, since it needs no Schema knowledge. Introduce `Schema.TaggedError` in the Schema lesson as the variant that crosses process boundaries such as HTTP and RPC.

**Catching: v4 names** ([REPO/migration/error-handling.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/error-handling.md))

| v3 | v4 |
|---|---|
| `Effect.catchAll` | **`Effect.catch`** |
| `Effect.catchAllCause` | **`Effect.catchCause`** |
| `Effect.catchAllDefect` | **`Effect.catchDefect`** |
| `Effect.catchTag` / `catchTags` / `catchIf` | unchanged |
| `Effect.catchSome` | `Effect.catchFilter` (uses the `Filter` module) |
| `Effect.catchSomeCause` | `Effect.catchCauseFilter` |
| `Effect.catchSomeDefect` | removed |
| — | new: `Effect.catchReason`, `Effect.catchReasons`, `Effect.unwrapReason` (nested `reason` errors), `Effect.catchEager` |

Notes on the table:

- `Effect.catchTag` also accepts an **array of tags**: `Effect.catchTag(["ParseError", "ReservedPortError"], handler)` (LLMS.md "Error handling basics"; `DOCS/error-management/expected-errors`).
- Other renames: `Effect.either` → **`Effect.result`** (returns `Result`; the `Either` module is now `Result`). `Effect.orElse` → `Effect.catch`. `Effect.tapErrorCause` → `Effect.tapCause`. `Effect.timeoutFail` → `Effect.timeoutOrElse` (v3-to-v4.md `effect/Effect` section). `Either.left`/`right` → `Result.fail`/`succeed`, and `match` uses `onFailure`/`onSuccess` (v3-to-v4.md `effect/Either` lines ~10233–10283).
- **Cause is flat in v4**: `cause.reasons: ReadonlyArray<Fail | Die | Interrupt>`. There is no more `Sequential` / `Parallel` tree. Predicates: `Cause.hasFails`, `hasDies`, `hasInterrupts`. Built-in errors were renamed `*Exception` → `*Error`, e.g. `Cause.TimeoutError`, `Cause.NoSuchElementError`, `Cause.UnknownError` ([REPO/migration/cause.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/cause.md)).

**Verified snippet: catchTag / catchTags / catch** (`snippets/src/04-tagged-errors.ts`, types asserted)

```ts
import { Data, Effect } from "effect"

class NetworkError extends Data.TaggedError("NetworkError")<{ readonly status: number }> {}
class ValidationError extends Data.TaggedError("ValidationError")<{ readonly field: string }> {}

declare const request: Effect.Effect<string, NetworkError | ValidationError>

const onlyNetwork = request.pipe(            // Effect<string, ValidationError>
  Effect.catchTag("NetworkError", (e) => Effect.succeed(`cached (status ${e.status})`))
)
const all = request.pipe(                    // Effect<string, never>
  Effect.catchTags({
    NetworkError: (e) => Effect.succeed(`network ${e.status}`),
    ValidationError: (e) => Effect.succeed(`invalid ${e.field}`)
  })
)
const anything = request.pipe(Effect.catch((e) => Effect.succeed(`failed: ${e._tag}`))) // v3: catchAll
const wrapped = request.pipe(Effect.mapError((e) => `wrapped ${e._tag}`)) // Effect<string, string>
```

The file uses a concrete `request` function instead of `declare` so that it runs.

**Verified snippet: defects** (`snippets/src/04-defects.ts`)

```ts
import { Cause, Effect, Exit } from "effect"

const expected = Effect.fail("card declined" as const)
const defect = Effect.die(new Error("bug: impossible state")) // Effect<never, never, never>
const thrown = Effect.sync(() => { throw new Error("thrown inside sync") }) // becomes a defect

const show = <A, E>(effect: Effect.Effect<A, E>) => {
  const exit = Effect.runSyncExit(effect)
  return Exit.isSuccess(exit) ? "success" : exit.cause.reasons.map((r) => r._tag).join(",")
}
show(expected) // "Fail"
show(defect)   // "Die"
show(thrown)   // "Die"

defect.pipe(Effect.catchDefect((d) => Effect.succeed(`recovered from: ${String(d)}`)))
thrown.pipe(Effect.catchCause((cause) => Effect.succeed(Cause.hasDies(cause) ? "had a defect" : "other")))
expected.pipe(Effect.orDie) // Effect<never, never, never> — failure moved to a defect
```

There are also `04-schema-tagged-error.ts` (a `Schema.TaggedError`, which is `instanceof Error`) and `04-result.ts` (`Effect.result` + `Result.match`, `Effect.option`).

---

## Lesson 5: Dependency injection (services, `R`, Layers)

**How v4 defines a service: `Context.Service`**

v4 has a single, unified way to define services. In [REPO/migration/services.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/services.md): "In v3, services were defined using `Context.Tag`, `Context.GenericTag`, `Effect.Tag`, or `Effect.Service`. In v4, all of these have been replaced by `Context.Service`."

- Class syntax: `class Db extends Context.Service<Db, Shape>()("app/Db") {}`. The type parameters come **first**, and the id string goes to the returned constructor. In v3 it was the other way round: `Context.Tag("Db")<Db, Shape>()`.
- Function syntax: `const Db = Context.Service<Shape>("app/Db")`.
- Signature and JSDoc: [REPO/packages/effect/src/Context.ts#L201](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Context.ts#L201).
- ⚠️ Early v4 betas called this module **`ServiceMap`** (`ServiceMap.Service`). It was renamed in **4.0.0-beta.44**: "Rename the `ServiceMap` module to `Context` across exports, docs, and tests" (effect-smol PR #1961, recorded in [REPO/packages/effect/CHANGELOG.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/CHANGELOG.md)). The 4.0.0 export list has **no `ServiceMap`** (verified). Beta-era blog posts and videos may show `ServiceMap.Service`.
- **Removed:** `Context.Tag`, `Context.GenericTag`, `Effect.Tag`, `Effect.Service`. All are verified absent at runtime on 4.0.0.
- Static accessor proxies such as `Notifications.notify(...)` are gone. Use `yield* Service`, which is preferred, or `Service.use(s => …)` / `Service.useSync(...)` (services.md: "**Prefer `yield*` over `use` in most cases.**").
- `Context.Service<Self>()("id", { make: effect })` stores a constructor. It "does **not** auto-generate a layer". There is no `.Default` and no `dependencies` option. You write `static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(...))` (services.md).
- Naming convention: "v4 adopts the convention of naming layers with `layer` (e.g. `Logger.layer`) instead of v3's `Default` or `Live`." Variants are `layerTest`, `layerConfig`, etc. (services.md). Older v4 website pages still use `ConfigLive` / `MainLive` variable names, which is fine either way.
- `Database.of({...})` is a typed identity helper for building the implementation (LLMS.md "Context.Service" example).
- `Database["Service"]` or `Context.Service.Shape<typeof Database>` gives you the shape type (LLMS.md; `DOCS/requirements-management/services`).
- The id string is the runtime identity: "Reusing the same key string for unrelated services makes them occupy the same slot" (Context.ts JSDoc). LLMS.md recommends ids like `"myapp/db/Database"`.
- `Context.Reference<T>("id", { defaultValue })` is a service with a default value. It also replaces v3 `FiberRef` ([REPO/migration/fiberref.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/fiberref.md)).

**Layers** (`DOCS/requirements-management/layers`; [REPO/packages/effect/src/Layer.ts](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Layer.ts))

- `Layer<ROut, E, RIn>` is a recipe for building services: it produces `ROut`, can fail with `E`, and needs `RIn`.
- `Layer.succeed(Tag, impl)` builds a layer from a value. `Layer.effect(Tag, effect)` builds one with an Effect.
  - In v4, `Layer.effect` **also handles scoped resources**. Its type is `Layer<I, E, Exclude<R, Scope>>` ([Layer.ts ~L1012–1030](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Layer.ts#L1012)).
  - That is because v3 `Layer.scoped` was merged into it: "`Layer.scoped` -> `Layer.effect`: Scoped acquisition was merged into Layer.effect" (v3-to-v4.md ~L11640). Likewise `Layer.scopedDiscard` → `Layer.effectDiscard`.
- `Layer.provide(dep)` feeds the dependency's output into this layer's input and **hides** the dependency. `Layer.provideMerge(dep)` does the same but **keeps** the dependency in the output. `Layer.merge(a, b)` / `Layer.mergeAll` put layers side by side (`DOCS/requirements-management/layers`; [REPO/ai-docs/src/01_effect/03_services/20_layer-composition.ts](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/ai-docs/src/01_effect/03_services/20_layer-composition.ts)).
- `Effect.provide(layer)` / `Effect.provideService(Tag, impl)` remove requirements from `R`.
- `Layer.unwrap(effect)` chooses a layer dynamically, e.g. from Config (`ai-docs/src/01_effect/03_services/20_layer-unwrap.ts`). `Layer.launch(layer)` runs a long-lived app (`ai-docs/src/01_effect/06_running/20_layer-launch.ts`). `Layer.mock(Tag, partialImpl)` exists for tests (Layer.ts ~L2316).
- **New in v4: layers are memoized across separate `Effect.provide` calls**, via a shared MemoMap. Opt out with `Layer.fresh` or `Effect.provide(layer, { local: true })`. The guide still recommends composing the layers first and providing once ([REPO/migration/layer-memoization.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/layer-memoization.md)).
- Design rule: "Service functions should avoid requiring dependencies directly … service operations should have the `Requirements` parameter set to `never`." Dependencies belong to the layer, not to the methods (`DOCS/requirements-management/layers`, "Avoiding Requirement Leakage").

**Verified snippet: define, use, provide** (`snippets/src/05-service.ts`)

```ts
import { Context, Effect } from "effect"

class Greeter extends Context.Service<Greeter, {
  readonly greet: (name: string) => Effect.Effect<string>
}>()("app/Greeter") {}

const program = Effect.gen(function*() {   // Effect<string, never, Greeter>
  const greeter = yield* Greeter
  return yield* greeter.greet("Ada")
})

const runnable = program.pipe(              // Effect<string, never, never>
  Effect.provideService(Greeter, { greet: (name) => Effect.succeed(`Hello, ${name}!`) })
)
console.log(Effect.runSync(runnable)) // "Hello, Ada!"
```

**Verified snippet: Layers and composition** (`snippets/src/05-layers.ts`, all four layer types asserted)

```ts
import { Context, Effect, Layer } from "effect"

class Config extends Context.Service<Config, { readonly dbUrl: string }>()("app/Config") {
  static readonly layer = Layer.succeed(Config, { dbUrl: "postgres://localhost/app" })
}

class Database extends Context.Service<Database, {
  readonly query: (sql: string) => Effect.Effect<string>
}>()("app/Database") {
  static readonly layerNoDeps = Layer.effect(          // Layer<Database, never, Config>
    Database,
    Effect.gen(function*() {
      const config = yield* Config
      yield* Effect.log(`connecting to ${config.dbUrl}`)
      return Database.of({ query: (sql) => Effect.succeed(`rows for "${sql}"`) })
    })
  )
  static readonly layer = this.layerNoDeps.pipe(Layer.provide(Config.layer)) // Layer<Database, never, never>
}

const both = Database.layerNoDeps.pipe(Layer.provideMerge(Config.layer)) // Layer<Database | Config>
const merged = Layer.merge(Config.layer, Database.layer)                  // Layer<Config | Database>

const program = Effect.gen(function*() {
  const db = yield* Database
  return yield* db.query("SELECT * FROM users")
})
console.log(await Effect.runPromise(program.pipe(Effect.provide(Database.layer))))
```

**Testing by swapping layers**

- `snippets/src/05-testing-swap-layer.ts` shows the same `signUp` logic run with a real `Mailer.layer` and with an in-memory `MailerTest` layer backed by a `Ref`. It uses `Layer.provideMerge` so the test can read the recorded mail.
- `snippets/src/05-testing.test.ts` shows `@effect/vitest`'s `it.effect(...)` with `Effect.provide(TestLayer)`. It passes under vitest 5.0.3.
- Upstream reference: [REPO/ai-docs/src/09_testing/20_layer-tests.ts](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/ai-docs/src/09_testing/20_layer-tests.ts) also shows `layer(TestLayer)("suite", (it) => …)`, which shares one layer across a describe block.

**Verified snippet: `make` (v3 `Effect.Service` replacement)** (`snippets/src/05-service-make.ts`)

```ts
import { Context, Effect, Layer } from "effect"

class Counter extends Context.Service<Counter>()("app/Counter", {
  make: Effect.sync(() => {
    let count = 0
    return { increment: Effect.sync(() => ++count) }
  })
}) {
  static readonly layer = Layer.effect(this, this.make) // you build the layer yourself
}
```

---

## Lesson 6: Resources & concurrency

**Resources** (`DOCS/resource-management/introduction`, `DOCS/resource-management/scope`; [Effect.ts#L6588 `acquireRelease`](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L6588), [#L6475 `scoped`](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L6475))

- `Effect.acquireRelease(acquire, (resource, exit) => release)` returns an effect that requires `Scope`.
- `Effect.scoped(effect)` provides a fresh Scope and closes it at the end. Finalizers run in **reverse acquisition order**, whatever the exit (observed).
- `Effect.acquireUseRelease` is the one-shot form. `Effect.addFinalizer` / `Effect.ensuring` / `Effect.onInterrupt` cover cleanup hooks.
- Inside `Layer.effect`, the layer's own scope is used, so the resource lives as long as the layer ([REPO/ai-docs/src/01_effect/05_resources/10_acquire-release.ts](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/ai-docs/src/01_effect/05_resources/10_acquire-release.ts)).
- v4 rename: `Scope.extend` → `Scope.provide` ([REPO/migration/scope.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/scope.md)).

```ts
// snippets/src/06-acquire-release.ts
import { Console, Effect } from "effect"

const openFile = (name: string) =>
  Effect.acquireRelease(
    Console.log(`open ${name}`).pipe(Effect.as({ name })),
    (file, exit) => Console.log(`close ${file.name} (exit: ${exit._tag})`)
  )

const program = Effect.gen(function*() {
  const a = yield* openFile("a.txt")
  const b = yield* openFile("b.txt")
  yield* Console.log(`using ${a.name} and ${b.name}`)
  return yield* Effect.fail("disk full")
})
await Effect.runPromiseExit(Effect.scoped(program))
// open a.txt / open b.txt / using … / close b.txt (exit: Failure) / close a.txt (exit: Failure)
```

**Concurrency** (`DOCS/concurrency/basic-concurrency`, `DOCS/concurrency/fibers`)

- `Effect.all([...], { concurrency })` and `Effect.forEach(items, f, { concurrency })` take `concurrency: number | "unbounded"`. **The default is sequential**: "By default, if you don't specify any concurrency option, effects will run sequentially".
  - Verified timings with 4 tasks of 100ms each: sequential ≈400ms, `concurrency: 2` ≈200ms, `"unbounded"` ≈100ms (`06-concurrency.ts`).
  - `Effect.all` also accepts structs/records. v3's `mode: "either"` became `mode: "result"` (v3-to-v4.md: "`Effect.All.ExtractMode` -> `Effect.All.Return`: The `either` extraction helper was removed; use `mode: "result"`").
- Structured concurrency: when one concurrent task fails, the others are interrupted. `Effect.race` interrupts the loser. Both were observed in `06-race-and-structured.ts`. The 4.0.0 changelog fixes edge cases here: "Interrupt losers in `Effect.race`… while other effects are still starting" ([REPO/packages/effect/CHANGELOG.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/CHANGELOG.md), #8607).
- Fibers (renamed in v4, [REPO/migration/forking.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/forking.md)):
  - `Effect.fork` → **`Effect.forkChild`**
  - `Effect.forkDaemon` → **`Effect.forkDetach`**
  - `forkScoped` and `forkIn` are unchanged.
  - `forkAll` and `forkWithErrorHandler` were removed.
  - Fork variants take `{ startImmediately?, uninterruptible? }`.
- A `Fiber` is **no longer an Effect**. Use `Fiber.join(fiber)` / `Fiber.await` / `Fiber.interrupt(fiber)`. Likewise, `Ref` and `Deferred` are not Effects; use `Ref.get` and `Deferred.await` ([REPO/migration/yieldable.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/yieldable.md)).

```ts
// snippets/src/06-fibers.ts (abridged)
const program = Effect.gen(function*() {
  const tickerFiber = yield* Effect.forkChild(ticker)          // v3: Effect.fork
  const workFiber = yield* Effect.forkChild(Effect.sleep("100 millis").pipe(Effect.as("work done")))
  const result = yield* Fiber.join(workFiber)
  yield* Fiber.interrupt(tickerFiber)                           // ticker's onInterrupt runs
  return result
})
```

**Timeouts and retries** (`DOCS/error-management/timing-out`, `DOCS/error-management/retrying`, `DOCS/scheduling/using-schedules`; [REPO/ai-docs/src/06_schedule/10_schedules.ts](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/ai-docs/src/06_schedule/10_schedules.ts))

- `Effect.timeout(duration)` gives `Effect<A, E | Cause.TimeoutError, R>` and interrupts the timed-out work ([Effect.ts#L4563](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L4563)). Catch it with `Effect.catchTag("TimeoutError", …)` (verified). Use `Effect.timeoutOrElse` for a custom fallback; it replaces v3 `timeoutFail` / `timeoutTo`.
- `Effect.retry(schedule)` or `Effect.retry({ times: n })` ([#L4089](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/src/Effect.ts#L4089)). Use `Effect.repeat` to repeat on success.
- Schedule constructors: `Schedule.recurs(n)`, `spaced(d)`, `exponential(d)`, `fixed(d)`, `Schedule.jittered`, `Schedule.while(({ input }) => …)`, `Schedule.setInputType<E>()`, `Schedule.tap`.
- **Schedule combinators renamed** (v3-to-v4.md ~L13902–14058):
  - `intersect` / `both` → `Schedule.max([a, b])`: continue while **all** continue, take the slowest delay.
  - `union` / `either` → `Schedule.min([a, b])`: continue while **any** continues, take the fastest delay.
  - `andThen` → `Schedule.concat`.
  - `compose` / `zipWith` have no direct replacement.
  - Verified that `Schedule.both` does not exist on 4.0.0.

```ts
// snippets/src/06-retry-schedule.ts (abridged)
const policy = Schedule.max([Schedule.exponential("10 millis"), Schedule.recurs(5)])
await Effect.runPromise(callApi.pipe(Effect.retry(policy)))      // succeeds on attempt 3
await Effect.runPromise(callApi.pipe(Effect.retry({ times: 5 })))
await Effect.runPromiseExit(slow.pipe(Effect.timeout("50 millis"))) // Failure (TimeoutError)
```

---

## Lesson 7: Schema basics + "what else is in the box"

**Schema is in core**

`import { Schema } from "effect"`. LLMS.md says: "All validation and domain modeling in Effect is done with `Schema`." The full guide is [REPO/packages/effect/SCHEMA.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/SCHEMA.md), and there are website pages under `DOCS/schema/*`. (Schema already moved into `effect` in v3.10, since `Schema.TaggedError` is `@since 3.10.0`. v4 is "Schema v4", with many API changes.)

Key v4 API facts ([REPO/migration/schema.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/schema.md) summary table):

- Decoding: `Schema.decodeUnknownSync(S)(input)` throws. `Schema.decodeUnknownEffect(S)` returns an Effect that fails with a `SchemaError`; this replaces v3 `decodeUnknown`. `decodeUnknownExit` replaces `decodeUnknownEither`. `encodeEffect` replaces `encode`.
- Variadic arguments became arrays:
  - `Schema.Literal("a","b")` → `Schema.Literals(["a","b"])`
  - `Schema.Union(A, B)` → `Schema.Union([A, B])`
  - `Schema.Tuple(A, B)` → `Schema.Tuple([A, B])`
- `Schema.Record({ key, value })` → `Schema.Record(key, value)`.
- Filters gained an `is` prefix and go through `.check(...)`: `Schema.String.check(Schema.isMinLength(1))`, `isInt`, `isGreaterThan`, etc. `positive`/`negative`/`nonNegative` were removed.
- JSON parsing: `parseJson(schema)` → `Schema.fromJsonString(schema)`.
- `*FromSelf` lost its suffix. ⚠️ **`Schema.Date` now means a `Date` object**, not an ISO string. Use `Schema.DateFromString` for strings ("Existing code can still type-check after upgrading while no longer accepting the same input").
- Renames: `annotations` → `annotate`, `compose` → `decodeTo`, `standardSchemaV1` → `toStandardSchemaV1`.
- `Schema.Class<Self>("id")({ fields })` defines a validated class. The constructor validates its input. Instances are `instanceof` the class and can have methods (SCHEMA.md "Classes and Opaque Types").
- `typeof S.Type` / `typeof S.Encoded` give the decoded and encoded types ([REPO/ai-docs/src/01_effect/02_schema/10_schema-basics.ts](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/ai-docs/src/01_effect/02_schema/10_schema-basics.ts)).

```ts
// snippets/src/07-schema.ts
import { Effect, Schema } from "effect"

const User = Schema.Struct({
  id: Schema.Int,
  name: Schema.String.check(Schema.isMinLength(1)),
  role: Schema.Literals(["admin", "member"]),
  nickname: Schema.optional(Schema.String)
})
type User = typeof User.Type
// = { readonly id: number; readonly name: string; readonly role: "admin" | "member"; readonly nickname?: string | undefined }

Schema.decodeUnknownSync(User)({ id: 1, name: "Ada", role: "admin" })

const program = Schema.decodeUnknownEffect(User)({ id: "1", name: "", role: "owner" }).pipe(
  Effect.catchTag("SchemaError", (e) => Effect.succeed(`invalid: ${e.message}`))
) // -> 'invalid: Expected number\n  at ["id"]'

Schema.decodeUnknownSync(Schema.fromJsonString(User))('{"id":2,"name":"Lin","role":"member"}')
```

`07-schema-class.ts` covers `Schema.Class` with a getter, decoding into an instance, and constructor validation that throws "Schema validation failed".

**Config** ([REPO/packages/effect/CONFIG.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/packages/effect/CONFIG.md), `DOCS/configuration`)

- Readers: `Config.String/Int/Port/Boolean/URL/Redacted/schema(...)`, plus `Config.withDefault`. Yielding a `Config` reads `process.env` by default.
- Swap the source with `ConfigProvider.layer(ConfigProvider.fromUnknown({...}))`. There are also `fromEnv`, `fromDotEnv` and `fromDir`.
- A missing key is a typed `ConfigError`.
- `Config.Redacted` values print as `<redacted>`.

All of this is verified in `07-config.ts`.

**Logging and tracing** (`DOCS/observability/logging`, `DOCS/observability/tracing`)

- Logging: `Effect.log`, `logInfo`, `logDebug` (hidden at the default Info level, observed), `logWarning`, `logError`. Also `Effect.annotateLogs({...})` and `Effect.withLogSpan("name")`, verified in `07-logging-tracing.ts`.
- Tracing: `Effect.fn("name")` and `Effect.withSpan("name")` create tracing spans (LLMS.md).
- Export: for new projects, use the lightweight OTLP modules in `effect/observability`, which are unstable. Use `@effect/opentelemetry` to integrate with an existing OTel setup (LLMS.md "Observability").
- v4 change: `FiberRef.currentLogLevel` etc. are now `References.*` and are set with `Effect.provideService(References.MinimumLogLevel, "Debug")` (fiberref.md).

**What else is in the box** (each listed in [REPO/LLMS.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/LLMS.md) with an ai-docs example)

- Streams: `Stream`, `Sink`, `Channel`.
- Messaging and state: `PubSub`, `Queue`, `Ref`, `SubscriptionRef`, STM-style `Tx*`. v3's `TRef` etc. were renamed `TxRef` etc. (v3-to-v4.md Import Map).
- Time: `DateTime`, `Duration`, `Cron`.
- Caching and batching: `Cache`, `RequestResolver`.
- `ManagedRuntime`, for embedding Effect in Hono, Express or React handlers.
- Testing: `effect/testing` (`TestClock`, `TestConsole`) and `@effect/vitest` (`it.effect`, `it.live`, `layer(...)`, property tests via `it.effect.prop`).
- Unstable subpaths: `effect/http` (HttpClient/server), `effect/http-api` (schema-first APIs with OpenAPI), `effect/sql` plus driver packages `@effect/sql-*`, `effect/cli`, `effect/ai` plus `@effect/ai-anthropic|openai|openrouter|…`, `effect/rpc`, `effect/cluster`, `effect/workflow`, `effect/process`, `effect/reactivity` (Atom).
- Platform packages: `@effect/platform-node|bun|deno|browser`, giving `NodeRuntime.runMain`, FileSystem, etc.

---

## v3 → v4 changes cheat list (for recognizing outdated tutorials)

Primary sources: [REPO/MIGRATION.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/MIGRATION.md), [REPO/migration/*.md](https://github.com/Effect-TS/effect/tree/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration), and the generated [REPO/migration/v3-to-v4.md](https://github.com/Effect-TS/effect/blob/67ba4e46a11ccda0b6761578bfd22c04ae00167d/migration/v3-to-v4.md) (1.3 MB, every API). ✅ means verified at runtime or by tsc against 4.0.0 in this research.

**If a tutorial shows the left column, it is v3.**

| v3 (outdated) | v4 | |
|---|---|---|
| `Context.Tag("X")<X, Shape>()`, `Context.GenericTag`, `Effect.Tag`, `Effect.Service` | `Context.Service<X, Shape>()("X")` / `Context.Service<Shape>("X")` / `Context.Service<X>()("X", { make })` | ✅ |
| `MyService.Default`, `dependencies: [...]`, static accessors `Svc.method()` | Write `static layer = Layer.effect(...)` yourself; `yield* Svc` or `Svc.use(...)` | ✅ |
| `ServiceMap.Service` (v4 betas before beta.44) | `Context.Service` | ✅ (no `ServiceMap` export in 4.0.0; CHANGELOG beta.44) |
| `Layer.scoped`, `Layer.scopedDiscard` | `Layer.effect`, `Layer.effectDiscard` | ✅ |
| `Effect.catchAll`, `catchAllCause`, `catchAllDefect`, `catchSome` | `Effect.catch`, `catchCause`, `catchDefect`, `catchFilter` | ✅ |
| `Effect.either`, `Either` module, `Either.left/right` | `Effect.result`, `Result` module, `Result.fail/succeed` | ✅ |
| `Effect.fork`, `Effect.forkDaemon` | `Effect.forkChild`, `Effect.forkDetach` | ✅ |
| `yield* fiber`, `yield* ref`, `yield* deferred` (they were Effect subtypes) | `Fiber.join`, `Ref.get`, `Deferred.await`; Option/Result/Config/services are `Yieldable` but need `.asEffect()` outside generators | yieldable.md |
| `Effect.andThen(x => plainValue)`, `Effect.tap(x => console.log(x))` | Must return an Effect: `Effect.map`, `Effect.tap(x => Effect.log(x))` | ✅ (not in migration docs) |
| `Effect.zipRight`, `Effect.zipLeft` | `Effect.andThen`, `Effect.zip + map` / `tap` | v3-to-v4.md |
| `Effect.async`, `Effect.fromNullable` | `Effect.callback`, `Effect.fromNullishOr` | ✅ |
| `Effect.timeoutFail`, `Effect.timeoutTo` | `Effect.timeoutOrElse` | ✅ (timeoutFail absent) |
| `Effect.runtime<R>()` + `Runtime.runFork(rt)` | `Effect.context<R>()` + `Effect.runForkWith(services)`; the `Runtime<R>` type was removed | runtime.md |
| `FiberRef`, `Effect.locally` | `Context.Reference`, `References.*`, `Effect.provideService` | fiberref.md |
| `Cause` tree (`Sequential`/`Parallel`/`Empty`), `Cause.isFailure`, `*Exception` | Flat `cause.reasons`, `Cause.hasFails`, `*Error` (e.g. `Cause.TimeoutError`) | cause.md |
| `FiberFailure` wrapping runPromise rejections | Raw squashed error is thrown/rejected | ✅ |
| `Scope.extend` | `Scope.provide` | scope.md |
| `Equal.equals({a:1},{a:1}) === false` | `true`: structural equality by default; `NaN` equals `NaN` | equality.md |
| `Schedule.intersect/both`, `union/either`, `andThen` | `Schedule.max([…])`, `Schedule.min([…])`, `Schedule.concat` | ✅ |
| `Schema.Literal("a","b")`, `Union(A,B)`, `decodeUnknown`, `parseJson`, `Schema.Date` (from string), `pattern`, `int()` | `Literals([…])`, `Union([A,B])`, `decodeUnknownEffect`, `fromJsonString`, `DateFromString`, `check(isPattern)`, `isInt` | ✅ (partly) / schema.md |
| `Effect.gen(this, function*(){})` | `Effect.gen({ self: this }, function*(){})` | generators.md |
| `Effect.Effect.Context<T>` type | `Effect.Services<T>` | v3-to-v4.md |
| `@effect/platform`, `@effect/rpc`, `@effect/cluster`, `@effect/cli`, `@effect/ai`, `@effect/sql` (core) as separate packages, versioned `0.x` | Merged into `effect` (`effect/http`, `effect/rpc`, `effect/cli`, `effect/ai`, `effect/sql` …); all `@effect/*` share the version `4.0.0` | MIGRATION.md |
| `effect/unstable/http` import paths (v4 betas) | `effect/http` | MIGRATION.md |
| `effect/TestClock` | `effect/testing/TestClock` | v3-to-v4.md Import Map |
| `TRef`, `TMap`, `TQueue` … | `TxRef`, `TxHashMap`, `TxQueue` … | v3-to-v4.md Import Map |
| Needed `runMain` to keep the process alive | Core runtime keeps the process alive; `runMain` is still recommended for signals and exit codes | fiber-keep-alive.md |
| `Effect.provide` twice builds the layer twice | Memoized across provides (`{ local: true }` / `Layer.fresh` to opt out) | layer-memoization.md |
| Layers named `FooLive` / `Foo.Default` | Convention is `Foo.layer`, `Foo.layerTest` | services.md |

---

## Glossary candidates

Definitions are paraphrased from the sources cited.

- **Effect / `Effect<A, E, R>`**: an immutable, lazy description of a program that succeeds with `A`, fails with `E`, and needs services `R` (`DOCS/getting-started/the-effect-type`).
- **Success / Error / Requirements channel**: the three type parameters, abbreviated `A`, `E`, `R` (same page).
- **Running at the edge**: calling `runPromise` / `runSync` / `runMain` once, at the program's entry point (same page; `DOCS/getting-started/running-effects`).
- **Generator / `Effect.gen` / `yield*`**: async/await-like syntax for sequencing effects (`DOCS/getting-started/using-generators`).
- **`Effect.fn`**: a function-with-generator-body constructor that adds a tracing span (LLMS.md).
- **Pipe / pipeline**: `x.pipe(f, g)` or `pipe(x, f, g)` composition (`DOCS/getting-started/building-pipelines`).
- **Expected error (failure) vs defect**: a typed, recoverable error in `E`, versus a bug or unexpected error kept only in `Cause` (`DOCS/error-management/two-error-types`).
- **Tagged error**: an error class with a `_tag` discriminant, created with `Data.TaggedError` or `Schema.TaggedError`. It is matched with `catchTag`.
- **Yieldable**: a value you can `yield*` in a generator (Effect, Option, Result, Config, service keys, errors) that is not necessarily an Effect (yieldable.md).
- **Cause**: the full record of why an effect failed, as a list of `Fail | Die | Interrupt` reasons (cause.md).
- **Exit**: `Success(value)` or `Failure(cause)`, the complete outcome of running an effect.
- **Result**: v4's success/failure data type, replacing v3 `Either`.
- **Service**: an interface your code depends on, identified by a **service key** (the `Context.Service` class).
- **Context**: the typed map from service keys to implementations (`DOCS/requirements-management/services`).
- **Layer `Layer<ROut, E, RIn>`**: a recipe that builds services, possibly from other services (`DOCS/requirements-management/layers`).
- **Provide**: satisfy a requirement, removing it from `R` (`Effect.provide`, `Effect.provideService`, `Layer.provide`, `Layer.provideMerge`).
- **Reference (`Context.Reference`)**: a service with a default value, also used for fiber-local settings such as log level.
- **Scope / finalizer**: the lifetime of resources and the cleanup actions that run when it closes (`DOCS/resource-management/scope`).
- **acquireRelease**: safe acquire/release pairing.
- **Fiber**: a lightweight virtual thread running an effect. It can be forked, joined or interrupted (`DOCS/concurrency/fibers`).
- **Interruption**: cancelling a running fiber. Finalizers still run.
- **Structured concurrency**: child fibers are tied to their parent's lifetime.
- **Schedule**: a composable policy for retry/repeat timing.
- **Schema**: a value describing a data type that can decode, encode and validate (SCHEMA.md).
- **Decode / Encode**: unknown → typed, and typed → serializable.
- **Config / ConfigProvider**: a typed config description, and the source it is read from.
- **ManagedRuntime**: a runtime built from a Layer, used to run effects from non-Effect code.
- **Stability tags**: `@stability unstable` (may break in minors) and `@stability experimental` (may break in patches).

---

## Recommended primary resources

- **https://effect.website/docs/v4**: official v4 docs. Onboarding → The Effect Type → Installation → Creating Effects → Errors → Concurrency. Add `.md` to any page URL to get raw Markdown.
- **https://effect.website/docs/v4/guides**: the full v4 topic index (services, layers, scope, schema, schedule, observability…).
- **https://effect.website/docs/v4/api**: v4 API reference, generated from JSDoc. The blog footer's "API reference" link still points to `/docs/v3/api`; make sure learners pick v4.
- **https://effect.website/blog/releases/effect/40**: the 4.0 release announcement, with performance numbers and the LTS policy.
- **https://github.com/Effect-TS/effect/blob/main/MIGRATION.md**: the official v3 → v4 guide and the index of per-topic migration pages. It is the best way to spot outdated tutorials.
- **https://github.com/Effect-TS/effect/blob/main/migration/v3-to-v4.md**: the generated rename map for every v3 API (huge, so search it).
- **https://github.com/Effect-TS/effect/blob/main/LLMS.md**: the maintainers' concise idiomatic-style guide (Effect.gen/fn, Context.Service, Schema.TaggedError, layers). It is the most opinionated "how we write v4" source.
- **https://github.com/Effect-TS/effect/tree/main/ai-docs/src**: small, typechecked example files per topic: basics, schema, services, errors, resources, running, stream, schedule, testing, http, sql, cli, ai.
- **https://github.com/Effect-TS/effect/blob/main/packages/effect/SCHEMA.md**: the complete Schema v4 guide (about 230 KB; read it in chunks).
- **https://github.com/Effect-TS/effect/blob/main/packages/effect/CONFIG.md**: the Config/ConfigProvider guide.
- **https://effect.website/docs/v4/getting-started/devtools**: Effect LSP (`@effect/tsgo`) setup, which catches floating effects and layer leaks. Needs TypeScript 7.
- **https://effect.website/play/**: the in-browser playground. Whether it defaults to v4 is UNVERIFIED.
- **https://effect.website/myths/**: the official answers to "is it slow / huge / hard". ⚠️ Partly stale: it uses v3 names.
- **Workshops playlist** (linked from the website footer): https://www.youtube.com/playlist?list=PLDf3uQLaK2B9vHzUNyvOSvoMv61LW7792. Whether its videos are v3 or v4 is UNVERIFIED.

## Communities

- **Discord**: https://discord.gg/effect-ts. This is the official one: "the core team and experienced users are there daily" (`DOCS/onboarding`; README "Links").
- **GitHub Issues**: https://github.com/Effect-TS/effect/issues. v4 issues go to `main`, and v3 PRs target the `v3` branch (README).
- **Community Hub** (meetups and events): https://effect.website/community-hub. **Effect Days** conference: https://effect.website/effect-days. **Podcast**: https://effect.website/podcast (all linked from the official site footer).
- **Social**: X https://x.com/EffectTS_, Bluesky https://bsky.app/profile/effect-ts.bsky.social, LinkedIn https://www.linkedin.com/company/effect-ts (README).
- **Adoption partners / jobs**: https://effect.website/adoption-partners, https://effect.website/effect-jobs (README).
- The blog names community projects built on Effect: Alchemy (cloud infrastructure) and Foldkit (frontend). These are secondary; they are only mentioned in the blog.

---

## Open questions / unverified

1. (Resolved) `ServiceMap` was renamed to `Context` in 4.0.0-beta.44, per CHANGELOG.md.
2. **Node minimum.** README says 18+ and the website says 22.18+. My guess is that 22.18 only matters for running `.ts` directly. UNVERIFIED which one the maintainers mean as the supported floor for `effect` itself.
3. **Bundle size numbers.** 7.1 kB (blog) vs ~6.3 kB (MIGRATION.md) for a minimal program. I did not measure either.
4. **`Data.TaggedError` vs `Schema.TaggedError` recommendation.** The website docs teach `Data.TaggedError`, and LLMS.md and ai-docs use `Schema.TaggedError` everywhere. No primary source states an explicit "prefer X" rule beyond LLMS.md's "Use Schema.TaggedError to define a custom error". Treat that as the maintainers' house style.
5. **The `andThen`/`tap` narrowing** is verified in the source and by tsc and runtime, but it is **not documented** in the migration guides. A short-lived doc gap is possible. Worth re-checking `migration/v3-to-v4.md` in later patch releases.
6. **Website pages lagging.** The Myths page (v3 names, ~25 KB) and the blog footer's API link (`/docs/v3/api`) are stale. Some v4 docs pages still use v3-style layer names (`ConfigLive`). Expect more of this in the weeks after 4.0.0.
7. **Playground and workshop videos**: whether they cover v4 is UNVERIFIED.
8. **Trade-offs marked as community wisdom** (the "Effect all the way" / function-colouring cost, and how hard teams find adoption) are not taken from a primary source. Treat them as UNVERIFIED and attribute them as opinion if you use them in the course.
9. The **adoption figures** in the blog (43.9M weekly downloads, 4.x at 56% of the last 7 days' downloads, measured before 4.0.0 was on `latest`, so presumably counting betas and RCs) are the project's own claims and were not independently verified.
