// Lesson 3: creating effects from values, sync code, throwing code, and Promises.
import { Data, Effect } from "effect"

class ParseError extends Data.TaggedError("ParseError")<{ readonly cause: unknown }> {}
class FetchError extends Data.TaggedError("FetchError")<{ readonly cause: unknown }> {}

// A value you already have
const fromValue = Effect.succeed(42) // Effect<number>

// An expected failure
const failure = Effect.fail(new ParseError({ cause: "bad" })) // Effect<never, ParseError>

// A synchronous side effect that will NOT throw
const now = Effect.sync(() => Date.now()) // Effect<number>

// Synchronous code that MIGHT throw -> map the exception to a typed error
const parse = (input: string) =>
  Effect.try({
    try: () => JSON.parse(input) as unknown,
    catch: (cause) => new ParseError({ cause })
  }) // Effect<unknown, ParseError>

// A Promise that MIGHT reject -> map the rejection to a typed error
const fetchUser = (id: number) =>
  Effect.tryPromise({
    try: () => (id === 1 ? Promise.resolve({ id, name: "Ada" }) : Promise.reject(new Error("404"))),
    catch: (cause) => new FetchError({ cause })
  }) // Effect<{ id: number; name: string }, FetchError>

console.log(Effect.runSync(fromValue))
console.log(typeof Effect.runSync(now))
console.log(Effect.runSync(parse('{"ok":true}')))
console.log(Effect.runSync(Effect.flip(parse("{oops")))._tag) // "ParseError"
console.log(Effect.runSync(Effect.flip(failure))._tag) // "ParseError"
console.log(await Effect.runPromise(fetchUser(1)))
console.log((await Effect.runPromise(Effect.flip(fetchUser(2))))._tag) // "FetchError"
