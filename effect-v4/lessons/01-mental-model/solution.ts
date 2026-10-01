// Lesson 1 solution. Run: node lessons/01-mental-model/solution.ts
import { Context, Data, Effect } from "effect"
import { check, expectSuccess, section, summary, type Equal, type Expect } from "../../assets/check.ts"

// ─── 1. Your first Effect ───────────────────────────────────────────────
const greeting: Effect.Effect<string> = Effect.succeed("hello")

// ─── 2. Laziness ────────────────────────────────────────────────────────
// Effect.sync stores the function and calls it each time the Effect is run.
// Effect.succeed(++calls) would be wrong: `++calls` is evaluated while defining.
let calls = 0
const tick: Effect.Effect<number> = Effect.sync(() => ++calls)

// ─── 3. Read the type ───────────────────────────────────────────────────
class Clock extends Context.Service<Clock, { readonly now: Effect.Effect<number> }>()("lesson1/Clock") {}
class TooEarly extends Data.TaggedError("TooEarly")<{ readonly hour: number }> {}

const mystery = Effect.gen(function*() {
  const clock = yield* Clock
  const hour = yield* clock.now
  if (hour < 9) return yield* new TooEarly({ hour })
  return `It is ${hour} o'clock`
})

type Success = string
type Failure = TooEarly
type Requirements = Clock
export type _mystery = Expect<Equal<Effect.Effect<Success, Failure, Requirements>, typeof mystery>>

// ─── 4. Provide, then run at the edge ───────────────────────────────────
const runnable: Effect.Effect<string, TooEarly> = mystery.pipe(
  Effect.provideService(Clock, { now: Effect.succeed(10) })
)

// ─── Checks ─────────────────────────────────────────────────────────────
section("1. Your first Effect")
await expectSuccess(`greeting succeeds with "hello"`, greeting, "hello")

section("2. Laziness")
check("defining tick must not run it (calls is still 0)", calls, 0)
await expectSuccess("first run of tick succeeds with 1", tick, 1)
await expectSuccess("second run of tick succeeds with 2 (same recipe, run again)", tick, 2)

section("3. Read the type")
console.log("  ℹ️  type-level check: run `npx tsc -p lessons/01-mental-model` (no output = correct)")

section("4. Provide, then run")
await expectSuccess(`runnable succeeds with "It is 10 o'clock"`, runnable, "It is 10 o'clock")

summary()
