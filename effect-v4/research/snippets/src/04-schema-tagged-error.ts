// Lesson 4: Schema.TaggedError — a tagged error whose fields are described by a Schema
// (so it can be serialized/validated, e.g. sent over RPC/HTTP). Used throughout the official ai-docs.
import { Effect, Schema } from "effect"

class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", {
  id: Schema.Int
}) {}

const findUser = Effect.fn("findUser")(function*(id: number) {
  if (id !== 1) {
    return yield* new UserNotFound({ id }) // yieldable: same as Effect.fail(new UserNotFound(...))
  }
  return { id, name: "Ada" }
})

const program = findUser(7).pipe(
  Effect.catchTag("UserNotFound", (e) => Effect.succeed(`no user with id ${e.id}`))
)

console.log(Effect.runSync(program)) // "no user with id 7"
console.log(new UserNotFound({ id: 7 }) instanceof Error) // true — it is a real Error subclass
