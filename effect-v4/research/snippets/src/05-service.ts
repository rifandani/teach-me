// Lesson 5: define a service with Context.Service (v4), use it with yield*, provide it.
import { Context, Effect } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

// 1) Define: class Name extends Context.Service<Self, Shape>()("unique-id") {}
class Greeter extends Context.Service<Greeter, {
  readonly greet: (name: string) => Effect.Effect<string>
}>()("app/Greeter") {}

// 2) Use: yield* the service class to get the implementation
const program = Effect.gen(function*() {
  const greeter = yield* Greeter
  return yield* greeter.greet("Ada")
})

// The requirement shows up in R
type _1 = Expect<Equal<typeof program, Effect.Effect<string, never, Greeter>>>

// 3) Provide an implementation; R becomes never and the effect can run
const runnable = program.pipe(
  Effect.provideService(Greeter, { greet: (name) => Effect.succeed(`Hello, ${name}!`) })
)
type _2 = Expect<Equal<typeof runnable, Effect.Effect<string, never, never>>>

console.log(Effect.runSync(runnable)) // "Hello, Ada!"
console.log(Greeter.key) // "app/Greeter"
