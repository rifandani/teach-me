// Lesson 7 exercise: Schema and Config.
//
//   Run the checks:   node lessons/07-schema-and-toolbox/exercise.ts
//   Type-level check: npx tsc -p lessons/07-schema-and-toolbox      (no output = correct)
//
// Replace every todo(), todoValue() and TODO comment below until everything passes.
// Stuck for more than a few minutes? Ask your teacher, or peek at solution.ts.
import { Config, ConfigProvider, Effect, Schema } from "effect"
import { check, expectFailure, expectSuccess, section, summary, todo, todoValue, type Equal, type Expect } from "../../assets/check.ts"

// ─── 1. One definition: type + validator ────────────────────────────────
// Finish the schema so a User has:
//   id:   an integer                    (done for you)
//   name: a string of at least 1 char   (Schema.String plus .check(...))
//   role: "admin" or "member"           (one schema for a set of literals)
const User = Schema.Struct({
  id: Schema.Int
  // TODO: name, role
})
type User = typeof User.Type
export type _user = Expect<Equal<User, {
  readonly id: number
  readonly name: string
  readonly role: "admin" | "member"
}>>

// ─── 2. Decode trusted-looking input, synchronously ─────────────────────
// Decode { id: 1, name: "Ada", role: "admin" } with the version that THROWS on bad input.
const ada: User = todoValue()

// ─── 3. Decode bad input as an Effect ───────────────────────────────────
// Decode `badInput` with the version that returns an Effect, so the failure
// lands in the error channel instead of being thrown.
const badInput: unknown = { id: 1, name: "", role: "owner" } // empty name, unknown role
const decodeBad: Effect.Effect<User, Schema.SchemaError> = todo()

// ─── 4. JSON string straight to a typed value ───────────────────────────
// Turn `json` into a User in one step: wrap User in the schema that parses JSON first.
const json = '{"id":2,"name":"Lin","role":"member"}'
const lin: User = todoValue()

// ─── 5. Typed config, with a test provider ──────────────────────────────
// serverConfig: read HOST (a string) and PORT (an integer) and succeed with "host:port".
// withTestConfig: run serverConfig against a provider built from { HOST: "localhost", PORT: "8080" }.
//   (ConfigProvider.fromUnknown builds the provider, ConfigProvider.layer turns it into a Layer.)
const serverConfig: Effect.Effect<string, Config.ConfigError> = todo()
const withTestConfig: Effect.Effect<string, Config.ConfigError> = todo()

// Given: the same program against an empty provider. Nothing to do here; just predict the result.
const EmptyConfig = ConfigProvider.layer(ConfigProvider.fromUnknown({}))
const withMissingConfig: Effect.Effect<string, Config.ConfigError> = serverConfig.pipe(Effect.provide(EmptyConfig))

// ─── Checks (no need to edit below) ─────────────────────────────────────
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
