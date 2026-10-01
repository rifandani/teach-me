// Lesson 7: built-in structured logging, log levels, annotations and spans.
import { Effect } from "effect"

const checkout = Effect.fn("checkout")(function*(orderId: string) {
  yield* Effect.logInfo("starting checkout")
  yield* Effect.logDebug("hidden by default: the default minimum level is Info")
  yield* Effect.sleep("10 millis")
  yield* Effect.logWarning("payment slow")
  return orderId
})

const program = checkout("order-42").pipe(
  Effect.annotateLogs({ orderId: "order-42" }), // key/values attached to every log line
  Effect.withLogSpan("checkout-flow") // adds elapsed time "checkout-flow=12ms" to log lines
)

await Effect.runPromise(program)
