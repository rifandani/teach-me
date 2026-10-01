// Lesson 4: tagged errors + catchTag / catchTags. Handled errors disappear from the type.
import { Data, Effect } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

class NetworkError extends Data.TaggedError("NetworkError")<{ readonly status: number }> {}
class ValidationError extends Data.TaggedError("ValidationError")<{ readonly field: string }> {}

const request = (mode: "net" | "val" | "ok"): Effect.Effect<string, NetworkError | ValidationError> =>
  mode === "net"
    ? Effect.fail(new NetworkError({ status: 503 }))
    : mode === "val"
    ? Effect.fail(new ValidationError({ field: "email" }))
    : Effect.succeed("data")

// catchTag handles ONE tag; the other stays in the error channel
const onlyNetwork = request("net").pipe(
  Effect.catchTag("NetworkError", (e) => Effect.succeed(`cached (status ${e.status})`))
)
type _1 = Expect<Equal<typeof onlyNetwork, Effect.Effect<string, ValidationError, never>>>

// catchTags handles several tags with one object of handlers
const all = request("val").pipe(
  Effect.catchTags({
    NetworkError: (e) => Effect.succeed(`network ${e.status}`),
    ValidationError: (e) => Effect.succeed(`invalid ${e.field}`)
  })
)
type _2 = Expect<Equal<typeof all, Effect.Effect<string, never, never>>>

// Effect.catch (v3: catchAll) handles every typed error
const anything = request("net").pipe(Effect.catch((e) => Effect.succeed(`failed: ${e._tag}`)))

// mapError transforms the error without recovering
const wrapped = request("val").pipe(Effect.mapError((e) => `wrapped ${e._tag}`))
type _3 = Expect<Equal<typeof wrapped, Effect.Effect<string, string, never>>>

console.log(Effect.runSync(onlyNetwork.pipe(Effect.orDie)))
console.log(Effect.runSync(all))
console.log(Effect.runSync(anything))
console.log(Effect.runSync(Effect.flip(wrapped)))
