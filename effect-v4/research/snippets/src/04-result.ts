// Lesson 4: turn errors into values with Effect.result (v3: Effect.either) or Effect.option.
import { Effect, Result } from "effect"

const parsePort = (s: string): Effect.Effect<number, string> => {
  const n = Number(s)
  return Number.isInteger(n) ? Effect.succeed(n) : Effect.fail(`not a port: ${s}`)
}

const program = Effect.gen(function*() {
  const r = yield* Effect.result(parsePort("abc")) // Result<number, string>, never fails
  const msg = Result.match(r, {
    onSuccess: (port) => `port ${port}`,
    onFailure: (err) => `error: ${err}`
  })
  const o = yield* Effect.option(parsePort("8080")) // Option<number>
  return [msg, o] as const
})

console.log(Effect.runSync(program))
