// Lesson 3: Effect.gen — write effectful code like async/await (yield* instead of await).
import { Data, Effect } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

class NotFound extends Data.TaggedError("NotFound")<{ readonly id: number }> {}

const findUser = (id: number) =>
  id === 1 ? Effect.succeed({ id, name: "Ada" }) : Effect.fail(new NotFound({ id }))

const getAge = (_name: string) => Effect.succeed(36)

const program = Effect.gen(function*() {
  const user = yield* findUser(1) // like `await`
  const age = yield* getAge(user.name)
  if (age < 18) {
    // yield a tagged error directly to fail; `return` it so TS knows we stop here
    return yield* new NotFound({ id: user.id })
  }
  return `${user.name} is ${age}`
})

// Errors from every step are collected into a union automatically
type _ = Expect<Equal<typeof program, Effect.Effect<string, NotFound, never>>>

console.log(Effect.runSync(program)) // "Ada is 36"
