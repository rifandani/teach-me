// Lesson 3: pipe-style composition with map / flatMap / andThen / tap.
import { Effect, pipe } from "effect"

const double = (n: number) => n * 2
const half = (n: number) => (n % 2 === 0 ? Effect.succeed(n / 2) : Effect.fail(`odd: ${n}`))

// Method style: effect.pipe(...)
const a = Effect.succeed(10).pipe(
  Effect.map(double), //              number -> number       (pure function)
  Effect.flatMap(half), //            number -> Effect       (effectful function)
  Effect.tap((n) => Effect.log(`got ${n}`)), // side effect, keeps the value
  Effect.andThen((n) => Effect.succeed(n + 1)) // in v4, andThen takes an Effect or a function returning an Effect
)

// Function style: pipe(value, ...fns) — identical result
const b = pipe(Effect.succeed(10), Effect.map(double), Effect.flatMap(half))

console.log(Effect.runSync(a)) // 11
console.log(Effect.runSync(b)) // 10
