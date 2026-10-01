// Lesson 3 exercise: building programs with constructors, Effect.gen, Effect.fn and pipe.
//
//   Run the checks:   node lessons/03-building-programs/exercise.ts
//   Type-level check: npx tsc -p lessons/03-building-programs      (no output = correct)
//
// Replace every todo() below until everything passes.
// Stuck for more than a few minutes? Ask your teacher, or peek at solution.ts.
import { Data, Effect } from "effect"
import { expectFailure, expectSuccess, section, summary, todo, type Equal, type Expect } from "../../assets/check.ts"

// Plain-TS helpers the tasks wrap (no network: a fake API backed by a Map). Don't edit these.
const users = new Map([[1, { id: 1, name: "Ada" }]])
const fakeApi = (id: number): Promise<{ id: number; name: string }> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const user = users.get(id)
      user ? resolve(user) : reject(new Error(`user ${id} not found`))
    }, 10)
  )
const delay = (ms: number): Promise<string> => new Promise((resolve) => setTimeout(() => resolve("waited"), ms))

class ParseError extends Data.TaggedError("ParseError")<{ readonly cause: unknown }> {}
class FetchError extends Data.TaggedError("FetchError")<{ readonly cause: unknown }> {}
class InvalidDiscount extends Data.TaggedError("InvalidDiscount")<{ readonly percent: number }> {}

// ─── 1. Pick the constructor ─────────────────────────────────────────────
// Each one wraps plain code. Choose from: succeed, fail, sync, try, tryPromise, promise.

// JSON.parse throws on bad input. Turn the exception into a ParseError({ cause }).
const parseConfig = (_text: string): Effect.Effect<unknown, ParseError> => todo()

// fakeApi(id) returns a Promise that rejects for unknown ids. Turn the rejection into FetchError({ cause }).
const loadProfile = (_id: number): Effect.Effect<{ id: number; name: string }, FetchError> => todo()

// delay(10) returns a Promise that never rejects. Wrap it.
const pause: Effect.Effect<string> = todo()

// ─── 2. async/await → Effect.gen ─────────────────────────────────────────
// Rewrite this as an Effect, using loadProfile instead of fakeApi:
//
//   async function greetUserAsync(id: number) {
//     const profile = await fakeApi(id)
//     return `Hello, ${profile.name}!`
//   }
//
// No return-type annotation: let TypeScript infer it. The type-level check below verifies it.
const greetUser = (_id: number) => todo()

export type _greetUser = Expect<Equal<ReturnType<typeof greetUser>, Effect.Effect<string, FetchError, never>>>

// ─── 3. Effect.fn with a validation failure ──────────────────────────────
// Replace the right-hand side with Effect.fn("applyDiscount")(function*(price: number, percent: number) { … }).
// percent outside 0..100 → fail with InvalidDiscount({ percent }). Otherwise return the discounted price.
// (Remember: `return yield* new InvalidDiscount(...)`.)
const applyDiscount = (_price: number, _percent: number) => todo()

export type _applyDiscount = Expect<
  Equal<ReturnType<typeof applyDiscount>, Effect.Effect<number, InvalidDiscount, never>>
>

// ─── 4. A pipe chain ─────────────────────────────────────────────────────
// Start from Effect.succeed([12, 30, 8]) and .pipe(...):
//   Effect.map to sum the prices (50), then Effect.flatMap into applyDiscount(total, 10) (45).
const cartTotal: Effect.Effect<number, InvalidDiscount> = todo()

// ─── Checks (no need to edit below) ──────────────────────────────────────
section("1. Pick the constructor")
await expectSuccess(`parseConfig('{"port":3000}') succeeds with the object`, parseConfig(`{"port":3000}`), { port: 3000 })
await expectFailure(`parseConfig("{oops") fails with ParseError`, parseConfig("{oops"), "ParseError")
await expectSuccess("loadProfile(1) succeeds with Ada", loadProfile(1), { id: 1, name: "Ada" })
await expectFailure("loadProfile(2) fails with FetchError", loadProfile(2), "FetchError")
await expectSuccess(`pause succeeds with "waited"`, pause, "waited")

section("2. async/await → Effect.gen")
await expectSuccess(`greetUser(1) succeeds with "Hello, Ada!"`, greetUser(1), "Hello, Ada!")
await expectFailure("greetUser(2) fails with FetchError", greetUser(2), "FetchError")
console.log("  ℹ️  type-level check: run `npx tsc -p lessons/03-building-programs` (no output = correct)")

section("3. Effect.fn")
await expectSuccess("applyDiscount(100, 20) succeeds with 80", applyDiscount(100, 20), 80)
await expectFailure("applyDiscount(100, 150) fails with InvalidDiscount", applyDiscount(100, 150), "InvalidDiscount")

section("4. A pipe chain")
await expectSuccess("cartTotal succeeds with 45 (50 minus 10%)", cartTotal, 45)

summary()
