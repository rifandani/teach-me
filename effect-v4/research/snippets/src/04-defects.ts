// Lesson 4: expected errors (fail) vs defects (die). Defects are NOT in the E type.
import { Cause, Effect, Exit } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

const expected = Effect.fail("card declined" as const) // Effect<never, "card declined">
const defect = Effect.die(new Error("bug: impossible state")) // Effect<never, never>
const thrown = Effect.sync(() => {
  throw new Error("thrown inside sync") // an exception in sync code becomes a defect
})

type _1 = Expect<Equal<typeof defect, Effect.Effect<never, never, never>>>

// Inspect the full outcome with Effect.exit / runSyncExit: an Exit holds a Cause
const show = <A, E>(effect: Effect.Effect<A, E>) => {
  const exit = Effect.runSyncExit(effect)
  if (Exit.isSuccess(exit)) return "success"
  // v4 Cause = flat list of reasons: Fail | Die | Interrupt
  return exit.cause.reasons.map((r) => r._tag).join(",")
}
console.log(show(expected)) // "Fail"
console.log(show(defect)) // "Die"
console.log(show(thrown)) // "Die"

// Effect.catch does NOT see defects; catchDefect / catchCause do (use at app boundaries)
const recovered = defect.pipe(Effect.catchDefect((d) => Effect.succeed(`recovered from: ${String(d)}`)))
console.log(Effect.runSync(recovered))

const viaCause = thrown.pipe(
  Effect.catchCause((cause) => Effect.succeed(Cause.hasDies(cause) ? "had a defect" : "other"))
)
console.log(Effect.runSync(viaCause))

// orDie: "this failure is unrecoverable here" — moves the error from E into a defect
const fatal = expected.pipe(Effect.orDie)
type _2 = Expect<Equal<typeof fatal, Effect.Effect<never, never, never>>>
console.log(show(fatal)) // "Die"
