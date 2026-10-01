// Lesson 2 solution. Run: node lessons/02-why-effect/solution.ts
import { Cause, Data, Effect } from "effect"
import { check, expectFailure, expectSuccess, section, summary, type Equal, type Expect } from "../../assets/check.ts"

// ─── Ready-made programs (no need to edit) ─────────────────────────────
class Flaky extends Data.TaggedError("Flaky")<{ readonly attempt: number }> {}

// Fails with Flaky the first `failures` times it is run, then succeeds with "ok".
const makeFlaky = (failures: number) => {
  let attempts = 0
  const effect = Effect.suspend(() => {
    attempts++
    return attempts <= failures ? Effect.fail(new Flaky({ attempt: attempts })) : Effect.succeed("ok")
  })
  return { effect, attempts: () => attempts }
}

// Takes 2 seconds to build a fresh report. Records if it was interrupted.
let cleanedUp = false
const slowReport: Effect.Effect<string> = Effect.sleep("2 seconds").pipe(
  Effect.as("fresh report"),
  Effect.onInterrupt(() => Effect.sync(() => { cleanedUp = true }))
)

// ─── 1. Retry without a loop ────────────────────────────────────────────
// Effect.retry re-runs the recipe. Effect.retry({ times: 3 }) would also work.
const flaky = makeFlaky(2)
const reliable: Effect.Effect<string, Flaky> = flaky.effect.pipe(Effect.retry({ times: 2 }))

// ─── 2. Operators show up in the type ───────────────────────────────────
const timedOut = slowReport.pipe(Effect.timeout("100 millis"))
type TimedOutError = Cause.TimeoutError
export type _timedOut = Expect<Equal<Effect.Error<typeof timedOut>, TimedOutError>>

// ─── 3. Time out, fall back, and clean up ───────────────────────────────
const withFallback: Effect.Effect<string> = slowReport.pipe(
  Effect.timeout("100 millis"),
  Effect.catchTag("TimeoutError", () => Effect.succeed("cached report"))
)

// ─── Checks ─────────────────────────────────────────────────────────────
section("0. Without help, the flaky effect just fails")
await expectFailure("a fresh flaky effect fails with Flaky on its first run", makeFlaky(2).effect, "Flaky")

section("1. Retry without a loop")
await expectSuccess(`reliable succeeds with "ok"`, reliable, "ok")
check("it took exactly 3 attempts (2 failures + 1 success)", flaky.attempts(), 3)

section("2. Operators show up in the type")
console.log("  ℹ️  type-level check: run `npx tsc -p lessons/02-why-effect` (no output = correct)")

section("3. Time out, fall back, and clean up")
const started = Date.now()
await expectSuccess(`withFallback succeeds with "cached report"`, withFallback, "cached report")
const elapsed = Date.now() - started
check("it waited about 100 millis, then gave up (instead of 2 seconds)", elapsed >= 90 && elapsed < 1000, true)
check("the slow task was interrupted and its cleanup ran", cleanedUp, true)

summary()
