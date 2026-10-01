// Lesson 1: the three type parameters Effect<Success, Error, Requirements>, a.k.a. <A, E, R>.
import { Context, Effect } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

class Clock extends Context.Service<Clock, { readonly now: Effect.Effect<number> }>()("app/Clock") {}

// Effect<number, never, never>: succeeds with number, cannot fail, needs nothing
const one = Effect.succeed(1)
// Effect<never, string, never>: never succeeds, fails with a string
const oops = Effect.fail("boom")
// Effect<number, never, Clock>: needs a Clock service before it can run
const time = Effect.gen(function*() {
  const clock = yield* Clock
  return yield* clock.now
})

type _1 = Expect<Equal<typeof one, Effect.Effect<number, never, never>>>
type _2 = Expect<Equal<typeof oops, Effect.Effect<never, string, never>>>
type _3 = Expect<Equal<typeof time, Effect.Effect<number, never, Clock>>>

// Utility types pull the parameters back out
type _4 = Expect<Equal<Effect.Success<typeof time>, number>>
type _5 = Expect<Equal<Effect.Error<typeof oops>, string>>
type _6 = Expect<Equal<Effect.Services<typeof time>, Clock>>

// Effect.runSync(time) // <- type error: Clock is not provided (R must be never to run)
const runnable = time.pipe(Effect.provideService(Clock, { now: Effect.succeed(42) }))
console.log(Effect.runSync(runnable)) // 42
