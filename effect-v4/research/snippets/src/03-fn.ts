// Lesson 3: Effect.fn — define a reusable function whose body is a generator.
// Effect.fn("name") also adds a tracing span and better stack traces.
import { Data, Effect } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

class InvalidAmount extends Data.TaggedError("InvalidAmount")<{ readonly amount: number }> {}

export const withdraw = Effect.fn("withdraw")(function*(balance: number, amount: number) {
  if (amount <= 0 || amount > balance) {
    return yield* new InvalidAmount({ amount })
  }
  yield* Effect.log(`withdrawing ${amount}`)
  return balance - amount
})

type _ = Expect<Equal<ReturnType<typeof withdraw>, Effect.Effect<number, InvalidAmount, never>>>

// Extra arguments after the generator are pipeable combinators applied to the result
export const withdrawOrZero = Effect.fn("withdrawOrZero")(
  function*(balance: number, amount: number) {
    return yield* withdraw(balance, amount)
  },
  Effect.catchTag("InvalidAmount", () => Effect.succeed(0))
)

console.log(Effect.runSync(withdraw(100, 30))) // 70
console.log(Effect.runSync(withdrawOrZero(100, 500))) // 0
