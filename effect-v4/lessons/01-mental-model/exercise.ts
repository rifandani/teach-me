// Lesson 1 exercise: the mental model.
//
//   Run the checks:   node lessons/01-mental-model/exercise.ts
//   Type-level check: npx tsc -p lessons/01-mental-model      (no output = correct)
//
// Replace every todo() and TODO below until everything passes.
// Stuck for more than a few minutes? Ask your teacher, or peek at solution.ts.
import { Context, Data, Effect } from "effect"
import { check, expectSuccess, section, summary, todo, type Equal, type Expect } from "../../assets/check.ts"

type TODO = "TODO: replace me"

// ─── 1. Your first Effect ───────────────────────────────────────────────
// Make an Effect that succeeds with the string "hello".
const greeting: Effect.Effect<string> = todo()

// ─── 2. Laziness ────────────────────────────────────────────────────────
// `tick` must add 1 to `calls` and succeed with the new value EVERY TIME IT IS RUN.
// Merely defining `tick` must leave `calls` at 0.
let calls = 0
const tick: Effect.Effect<number> = todo()

// ─── 3. Read the type ───────────────────────────────────────────────────
// Read `mystery` and write down its three channels. Don't hover in your editor first:
// predict, then check with `npx tsc -p lessons/01-mental-model`.
// (Clock is a service and TooEarly is a tagged error; lessons 4 and 5 cover both.)
class Clock extends Context.Service<Clock, { readonly now: Effect.Effect<number> }>()("lesson1/Clock") {}
class TooEarly extends Data.TaggedError("TooEarly")<{ readonly hour: number }> {}

const mystery = Effect.gen(function*() {
  const clock = yield* Clock
  const hour = yield* clock.now
  if (hour < 9) return yield* new TooEarly({ hour })
  return `It is ${hour} o'clock`
})

type Success = TODO
type Failure = TODO
type Requirements = TODO
export type _mystery = Expect<Equal<Effect.Effect<Success, Failure, Requirements>, typeof mystery>>

// ─── 4. Provide, then run at the edge ───────────────────────────────────
// `mystery` needs a Clock, so it can't be run yet. Build `runnable` from `mystery` by
// providing a Clock whose `now` succeeds with 10. (Look for Effect.provideService.)
const runnable: Effect.Effect<string, TooEarly> = todo()

// ─── Checks (no need to edit below) ─────────────────────────────────────
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
