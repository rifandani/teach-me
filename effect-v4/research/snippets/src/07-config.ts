// Lesson 7: typed configuration with Config + ConfigProvider (env vars by default).
import { Config, ConfigProvider, Effect } from "effect"

const program = Effect.gen(function*() {
  const host = yield* Config.String("HOST")
  const port = yield* Config.Port("PORT").pipe(Config.withDefault(3000))
  const apiKey = yield* Config.Redacted("API_KEY") // secret: prints as <redacted>
  return { host, port, apiKey: String(apiKey) }
})

// In production the default provider reads process.env. Here we swap in a test provider:
const TestConfig = ConfigProvider.layer(ConfigProvider.fromUnknown({ HOST: "localhost", API_KEY: "s3cret" }))
console.log(Effect.runSync(program.pipe(Effect.provide(TestConfig))))

// Missing config is a typed failure (ConfigError), not a crash at import time
const exit = Effect.runSyncExit(program.pipe(Effect.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({})))))
console.log(exit._tag) // "Failure"
