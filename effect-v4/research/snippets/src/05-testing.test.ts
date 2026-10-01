// Lesson 5: testing with @effect/vitest — `it.effect` runs an Effect as a test.
import { assert, describe, it } from "@effect/vitest"
import { Context, Effect, Layer } from "effect"

class Weather extends Context.Service<Weather, {
  readonly tempC: (city: string) => Effect.Effect<number>
}>()("app/Weather") {}

const describeWeather = Effect.fn("describeWeather")(function*(city: string) {
  const weather = yield* Weather
  const t = yield* weather.tempC(city)
  return t > 25 ? "hot" : "mild"
})

// Test layer: a fixed fake implementation instead of a real HTTP API
const WeatherTest = Layer.succeed(Weather, { tempC: () => Effect.succeed(30) })

describe("describeWeather", () => {
  it.effect("says hot when above 25C", () =>
    Effect.gen(function*() {
      const result = yield* describeWeather("Jakarta")
      assert.strictEqual(result, "hot")
    }).pipe(Effect.provide(WeatherTest)))
})
