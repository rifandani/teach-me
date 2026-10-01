// Lesson 2: a Promise cannot be cancelled; an Effect can be interrupted, and cleanup still runs.
import { Effect } from "effect"

const slowTask = Effect.gen(function*() {
  yield* Effect.log("task started")
  yield* Effect.sleep("2 seconds")
  yield* Effect.log("task finished") // never printed: the task is interrupted
  return "result"
}).pipe(
  Effect.onInterrupt(() => Effect.log("task interrupted, cleanup ran"))
)

// Effect.timeout interrupts the task after 100ms and fails with a Cause.TimeoutError
const program = slowTask.pipe(
  Effect.timeout("100 millis"),
  Effect.catchTag("TimeoutError", () => Effect.succeed("fallback"))
)

console.log(await Effect.runPromise(program)) // "fallback"
