// Lesson 8 solution. Run: node lessons/08-adoption-verdict/solution.ts
import { Context, Data, Effect, Layer, ManagedRuntime, Result, Schedule } from "effect"
import { check, expectSuccess, section, summary } from "../../assets/check.ts"

// ═══ Task 1: translate v3 code to v4 ═════════════════════════════════════
class WeatherDown extends Data.TaggedError("WeatherDown")<{ readonly city: string }> {}

// v3: class Weather extends Context.Tag("lesson8/Weather")<Weather, {...}>() {}
class Weather extends Context.Service<Weather, {
  readonly forecast: (city: string) => Effect.Effect<string, WeatherDown>
}>()("lesson8/Weather") {}

// v3: Schedule.intersect → v4: Schedule.max([...]);  v3: Effect.catchAll → v4: Effect.catch
const forecastOrUnknown = (city: string): Effect.Effect<string, never, Weather> =>
  Effect.gen(function*() {
    const weather = yield* Weather
    return yield* weather.forecast(city).pipe(
      Effect.retry(Schedule.max([Schedule.spaced("10 millis"), Schedule.recurs(2)])),
      Effect.catch(() => Effect.succeed("unknown"))
    )
  })

// v3: Effect.either → v4: Effect.result (Either → Result)
const forecastResult = (city: string): Effect.Effect<Result.Result<string, WeatherDown>, never, Weather> =>
  Effect.gen(function*() {
    const weather = yield* Weather
    return yield* Effect.result(weather.forecast(city))
  })

// ═══ Task 2: Effect inside an existing app, via ManagedRuntime ═══════════
type User = { readonly id: number; readonly name: string }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ readonly id: number }> {}

let repoBuilds = 0
let repoClosed = false

class UserRepo extends Context.Service<UserRepo, {
  readonly findById: (id: number) => Effect.Effect<User, UserNotFound>
}>()("lesson8/UserRepo") {
  // Pretend this opens a connection pool: built once, closed on dispose.
  static readonly layer = Layer.effect(
    UserRepo,
    Effect.gen(function*() {
      yield* Effect.acquireRelease(
        Effect.sync(() => { repoBuilds++ }),
        () => Effect.sync(() => { repoClosed = true })
      )
      const users = new Map<number, User>([[1, { id: 1, name: "Ada" }]])
      return UserRepo.of({
        findById: (id) => {
          const user = users.get(id)
          return user ? Effect.succeed(user) : Effect.fail(new UserNotFound({ id }))
        }
      })
    })
  )
}

const getUser = Effect.fn("getUser")(function*(id: number) {
  const repo = yield* UserRepo
  return yield* repo.findById(id)
})

// The rest of the app is plain TypeScript and knows nothing about Effect.
type Request = { readonly params: { readonly id: string } }
type Response = { readonly status: number; readonly body: unknown }

// 2a. One runtime for the whole app, built from your Layer.
const runtime = ManagedRuntime.make(UserRepo.layer)

// 2b. An ordinary async route handler that runs an Effect at the edge.
const handler = async (req: Request): Promise<Response> =>
  runtime.runPromise(
    getUser(Number(req.params.id)).pipe(
      Effect.map((user): Response => ({ status: 200, body: user })),
      Effect.catchTag("UserNotFound", () => Effect.succeed<Response>({ status: 404, body: { error: "UserNotFound" } }))
    )
  )

// 2c. On app shutdown, release everything the Layer acquired.
const shutdown = async (): Promise<void> => {
  await runtime.dispose()
}

// ─── Checks ──────────────────────────────────────────────────────────────
const makeWeather = (failuresBeforeSuccess: number) => {
  let attempts = 0
  const service = Weather.of({
    forecast: (city) =>
      Effect.suspend(() => {
        attempts++
        return attempts <= failuresBeforeSuccess
          ? Effect.fail(new WeatherDown({ city }))
          : Effect.succeed(`sunny in ${city}`)
      })
  })
  return { service, attempts: () => attempts }
}

section("Task 1: translate v3 to v4")
{
  const flaky = makeWeather(2)
  await expectSuccess(
    "forecastOrUnknown retries a flaky service until it works",
    forecastOrUnknown("Paris").pipe(Effect.provideService(Weather, flaky.service)),
    "sunny in Paris"
  )
  check("…which took exactly 3 attempts", flaky.attempts(), 3)

  const down = makeWeather(Infinity)
  await expectSuccess(
    `forecastOrUnknown falls back to "unknown" when it never works`,
    forecastOrUnknown("Atlantis").pipe(Effect.provideService(Weather, down.service)),
    "unknown"
  )
  check("…after 1 try + 2 retries (Schedule.recurs(2))", down.attempts(), 3)

  await expectSuccess(
    "forecastResult turns a failure into a Result value",
    forecastResult("Atlantis").pipe(Effect.map(Result.isFailure), Effect.provideService(Weather, makeWeather(Infinity).service)),
    true
  )
}

section("Task 2: ManagedRuntime in a plain async app")
await expectSuccess("GET /users/1 → 200 with Ada", Effect.promise(() => handler({ params: { id: "1" } })), {
  status: 200,
  body: { id: 1, name: "Ada" }
})
await expectSuccess("GET /users/2 → 404", Effect.promise(() => handler({ params: { id: "2" } })), {
  status: 404,
  body: { error: "UserNotFound" }
})
check("the Layer was built once and shared by both requests", repoBuilds, 1)
await expectSuccess("shutdown() resolves", Effect.promise(() => shutdown()), undefined)
check("dispose ran the Layer's finalizer (pool closed)", repoClosed, true)

summary()
