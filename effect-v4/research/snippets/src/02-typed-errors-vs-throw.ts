// Lesson 2: thrown exceptions are invisible in types; Effect puts failures in the signature.
import { Data, Effect } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

// Plain TypeScript: the signature says `number`, but it can throw.
const divideThrows = (a: number, b: number): number => {
  if (b === 0) throw new Error("Cannot divide by zero")
  return a / b
}

// Effect: the possible failure is part of the type.
class DivideByZero extends Data.TaggedError("DivideByZero")<{}> {}

// Tip: annotate the return type when branches return different Effects,
// otherwise TS infers a union of two Effect types instead of one Effect.
const divide = (a: number, b: number): Effect.Effect<number, DivideByZero> =>
  b === 0 ? Effect.fail(new DivideByZero()) : Effect.succeed(a / b)

// The compiler now forces you to decide what to do with DivideByZero before you get a plain number.
const safe = divide(1, 0).pipe(
  Effect.catchTag("DivideByZero", () => Effect.succeed(Infinity))
)
type _2 = Expect<Equal<typeof safe, Effect.Effect<number, never, never>>>

console.log(Effect.runSync(safe)) // Infinity
try {
  divideThrows(1, 0)
} catch (e) {
  console.log("plain TS: you had to *remember* to catch:", (e as Error).message)
}
