// Lesson 6: fibers — lightweight "virtual threads". fork, join, interrupt.
import { Effect, Fiber } from "effect"

const ticker = Effect.gen(function*() {
  let i = 0
  while (true) {
    yield* Effect.log(`tick ${++i}`)
    yield* Effect.sleep("40 millis")
  }
}).pipe(Effect.onInterrupt(() => Effect.log("ticker interrupted")))

const program = Effect.gen(function*() {
  // v4: Effect.forkChild (v3: Effect.fork) starts a child fiber supervised by the parent
  const tickerFiber = yield* Effect.forkChild(ticker)
  const workFiber = yield* Effect.forkChild(Effect.sleep("100 millis").pipe(Effect.as("work done")))

  const result = yield* Fiber.join(workFiber) // wait for a fiber's result
  yield* Fiber.interrupt(tickerFiber) // stop the other one
  return result
})

console.log(await Effect.runPromise(program))
