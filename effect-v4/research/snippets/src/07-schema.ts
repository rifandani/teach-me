// Lesson 7: Schema lives in the core `effect` package: `import { Schema } from "effect"`.
import { Effect, Schema } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

// One definition -> a TypeScript type AND a runtime validator
const User = Schema.Struct({
  id: Schema.Int,
  name: Schema.String.check(Schema.isMinLength(1)),
  role: Schema.Literals(["admin", "member"]), // v3: Schema.Literal("admin", "member")
  nickname: Schema.optional(Schema.String)
})
type User = typeof User.Type
type _ = Expect<Equal<User, {
  readonly id: number
  readonly name: string
  readonly role: "admin" | "member"
  readonly nickname?: string | undefined
}>>

// Sync decoding: throws on invalid input
console.log(Schema.decodeUnknownSync(User)({ id: 1, name: "Ada", role: "admin" }))

// Effect decoding: invalid input becomes a typed SchemaError in the error channel
const decodeUser = Schema.decodeUnknownEffect(User)
const program = decodeUser({ id: "1", name: "", role: "owner" }).pipe(
  Effect.catchTag("SchemaError", (e) => Effect.succeed(`invalid: ${e.message}`))
)
console.log(Effect.runSync(program))

// Parse a JSON string straight into a typed value (v3: Schema.parseJson(User))
const UserFromJson = Schema.fromJsonString(User)
console.log(Schema.decodeUnknownSync(UserFromJson)('{"id":2,"name":"Lin","role":"member"}'))
