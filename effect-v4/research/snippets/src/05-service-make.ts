// Lesson 5: Context.Service with a `make` constructor (replacement for v3 Effect.Service).
// v4 does NOT auto-generate a `.Default` layer — you build `layer` yourself from `make`.
import { Context, Effect, Layer } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

class Counter extends Context.Service<Counter>()("app/Counter", {
  make: Effect.sync(() => {
    let count = 0
    return {
      increment: Effect.sync(() => ++count)
    }
  })
}) {
  static readonly layer = Layer.effect(this, this.make)
}

type _ = Expect<Equal<typeof Counter.layer, Layer.Layer<Counter, never, never>>>

const program = Effect.gen(function*() {
  const counter = yield* Counter
  yield* counter.increment
  return yield* counter.increment
})

console.log(Effect.runSync(program.pipe(Effect.provide(Counter.layer)))) // 2
