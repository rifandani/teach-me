// Lesson 6: structured concurrency — when one concurrent task fails, siblings are interrupted.
import { Effect } from "effect"

const slow = Effect.sleep("1 second").pipe(
  Effect.as("slow"),
  Effect.onInterrupt(() => Effect.log("slow task interrupted"))
)
const failing = Effect.sleep("50 millis").pipe(Effect.andThen(Effect.fail("boom")))

const exit = await Effect.runPromiseExit(Effect.all([slow, failing], { concurrency: "unbounded" }))
console.log(exit._tag) // "Failure" after ~50ms, not 1s

// race: first to succeed wins; the loser is interrupted
const winner = await Effect.runPromise(
  Effect.race(slow, Effect.sleep("20 millis").pipe(Effect.as("fast")))
)
console.log(winner) // "fast"
