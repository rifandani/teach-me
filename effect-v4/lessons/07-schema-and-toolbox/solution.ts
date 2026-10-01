// Lesson 7 solution. Run: node lessons/07-schema-and-toolbox/solution.ts
import { Config, ConfigProvider, Effect, Schema } from "effect"
import { check, expectFailure, expectSuccess, section, summary, type Equal, type Expect } from "../../assets/check.ts"

// ─── 1. One definition: type + validator ────────────────────────────────
const User = Schema.Struct({
  id: Schema.Int,
  name: Schema.String.check(Schema.isMinLength(1)),
  role: Schema.Literals(["admin", "member"])
})
type User = typeof User.Type
export type _user = Expect<Equal<User, {
  readonly id: number
  readonly name: string
  readonly role: "admin" | "member"
}>>

// ─── 2. Decode trusted-looking input, synchronously ─────────────────────
const ada: User = Schema.decodeUnknownSync(User)({ id: 1, name: "Ada", role: "admin" })

// ─── 3. Decode bad input as an Effect ───────────────────────────────────
const badInput: unknown = { id: 1, name: "", role: "owner" } // empty name, unknown role
const decodeBad: Effect.Effect<User, Schema.SchemaError> = Schema.decodeUnknownEffect(User)(badInput)

// ─── 4. JSON string straight to a typed value ───────────────────────────
const json = '{"id":2,"name":"Lin","role":"member"}'
const lin: User = Schema.decodeUnknownSync(Schema.fromJsonString(User))(json)

// ─── 5. Typed config, with a test provider ──────────────────────────────
const serverConfig = Effect.gen(function*() {
  const host = yield* Config.String("HOST")
  const port = yield* Config.Int("PORT")
  return `${host}:${port}`
})
const TestConfig = ConfigProvider.layer(ConfigProvider.fromUnknown({ HOST: "localhost", PORT: "8080" }))
const withTestConfig: Effect.Effect<string, Config.ConfigError> = serverConfig.pipe(Effect.provide(TestConfig))
const EmptyConfig = ConfigProvider.layer(ConfigProvider.fromUnknown({}))
const withMissingConfig: Effect.Effect<string, Config.ConfigError> = serverConfig.pipe(Effect.provide(EmptyConfig))

// ─── Checks ─────────────────────────────────────────────────────────────
section("1. One definition: type + validator")
console.log("  ℹ️  type-level check: run `npx tsc -p lessons/07-schema-and-toolbox` (no output = correct)")

section("2. decodeUnknownSync")
check("ada decodes to a typed User", ada, { id: 1, name: "Ada", role: "admin" })

section("3. decodeUnknownEffect")
await expectFailure(`bad input fails with "SchemaError" in the error channel`, decodeBad, "SchemaError")

section("4. fromJsonString")
check("the JSON string decodes to Lin", lin, { id: 2, name: "Lin", role: "member" })

section("5. Config")
await expectSuccess(`serverConfig reads "localhost:8080" from the test provider`, withTestConfig, "localhost:8080")
await expectFailure(`a missing key fails with "ConfigError"`, withMissingConfig, "ConfigError")

summary()
