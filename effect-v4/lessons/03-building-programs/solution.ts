// Lesson 3 solution. Run: node lessons/03-building-programs/solution.ts
import { Data, Effect } from "effect"
import { expectFailure, expectSuccess, section, summary, type Equal, type Expect } from "../../assets/check.ts"

// Plain-TS helpers the tasks wrap (no network: a fake API backed by a Map)
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
// JSON.parse can throw → Effect.try maps the exception to a typed error
const parseConfig = (text: string): Effect.Effect<unknown, ParseError> =>
  Effect.try({
    try: () => JSON.parse(text) as unknown,
    catch: (cause) => new ParseError({ cause })
  })

// A Promise that can reject → Effect.tryPromise
const loadProfile = (id: number): Effect.Effect<{ id: number; name: string }, FetchError> =>
  Effect.tryPromise({
    try: () => fakeApi(id),
    catch: (cause) => new FetchError({ cause })
  })

// A Promise that never rejects → Effect.promise
const pause: Effect.Effect<string> = Effect.promise(() => delay(10))

// ─── 2. async/await → Effect.gen ─────────────────────────────────────────
// The original:
//   async function greetUserAsync(id: number) {
//     const profile = await fakeApi(id)
//     return `Hello, ${profile.name}!`
//   }
const greetUser = (id: number) =>
  Effect.gen(function*() {
    const profile = yield* loadProfile(id)
    return `Hello, ${profile.name}!`
  })

export type _greetUser = Expect<Equal<ReturnType<typeof greetUser>, Effect.Effect<string, FetchError, never>>>

// ─── 3. Effect.fn with a validation failure ──────────────────────────────
const applyDiscount = Effect.fn("applyDiscount")(function*(price: number, percent: number) {
  if (percent < 0 || percent > 100) {
    return yield* new InvalidDiscount({ percent })
  }
  return (price * (100 - percent)) / 100
})

export type _applyDiscount = Expect<
  Equal<ReturnType<typeof applyDiscount>, Effect.Effect<number, InvalidDiscount, never>>
>

// ─── 4. A pipe chain ─────────────────────────────────────────────────────
const cartTotal: Effect.Effect<number, InvalidDiscount> = Effect.succeed([12, 30, 8]).pipe(
  Effect.map((prices) => prices.reduce((sum, p) => sum + p, 0)), // 50
  Effect.flatMap((total) => applyDiscount(total, 10)) // 45
)

// ─── Checks ──────────────────────────────────────────────────────────────
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
