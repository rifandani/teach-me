// Lesson 5 solution. Run: node lessons/05-dependency-injection/solution.ts
import { Context, Data, Effect, Layer, Ref } from "effect"
import { expectFailure, expectSuccess, section, summary, type Equal, type Expect } from "../../assets/check.ts"

// ─── Given: the domain ──────────────────────────────────────────────────
interface User {
  readonly email: string
}
class EmailTaken extends Data.TaggedError("EmailTaken")<{ readonly email: string }> {}

// ─── Given: services (worked examples) ──────────────────────────────────
// A Ref is a mutable cell you read and update with Effects (more in lesson 6).
class UserRepo extends Context.Service<UserRepo, {
  readonly exists: (email: string) => Effect.Effect<boolean>
  readonly insert: (email: string) => Effect.Effect<User>
}>()("lesson5/UserRepo") {
  // An in-memory "database". Each time the layer is built, it starts empty.
  static readonly layer = Layer.effect(
    UserRepo,
    Effect.gen(function*() {
      const emails = yield* Ref.make<ReadonlyArray<string>>([])
      return UserRepo.of({
        exists: (email) => Ref.get(emails).pipe(Effect.map((all) => all.includes(email))),
        insert: (email) => Ref.update(emails, (all) => [...all, email]).pipe(Effect.as({ email }))
      })
    })
  )
}

class SmtpConfig extends Context.Service<SmtpConfig, { readonly host: string }>()("lesson5/SmtpConfig") {
  static readonly layer = Layer.succeed(SmtpConfig, { host: "smtp.example.com" })
}

// A test-only service: the list of addresses the fake Mailer "sent" to.
class Outbox extends Context.Service<Outbox, Ref.Ref<ReadonlyArray<string>>>()("lesson5/Outbox") {
  static readonly layer = Layer.effect(Outbox, Ref.make<ReadonlyArray<string>>([]))
}

// ─── Task 2: a Layer that has its own dependency ────────────────────────
class Mailer extends Context.Service<Mailer, {
  readonly send: (to: string, body: string) => Effect.Effect<void>
}>()("lesson5/Mailer") {
  static readonly layer: Layer.Layer<Mailer, never, SmtpConfig> = Layer.effect(
    Mailer,
    Effect.gen(function*() {
      const config = yield* SmtpConfig // the dependency belongs to the layer…
      return Mailer.of({
        send: (to, body) => Effect.log(`[${config.host}] to=${to}: ${body}`) // …so send has R = never
      })
    })
  )
}

// ─── Task 1: business logic that only knows the interfaces ──────────────
const signUp = Effect.fn("signUp")(function*(email: string) {
  const repo = yield* UserRepo
  const mailer = yield* Mailer
  if (yield* repo.exists(email)) return yield* new EmailTaken({ email })
  const user = yield* repo.insert(email)
  yield* mailer.send(email, "Welcome!")
  return user
})

export type _requirements = Expect<Equal<Effect.Services<ReturnType<typeof signUp>>, UserRepo | Mailer>>
export type _errors = Expect<Equal<Effect.Error<ReturnType<typeof signUp>>, EmailTaken>>

// ─── Task 3: compose the "live" app layer ───────────────────────────────
const liveLayer: Layer.Layer<UserRepo | Mailer> = Layer.merge(
  UserRepo.layer,
  Mailer.layer.pipe(Layer.provide(SmtpConfig.layer)) // feed SmtpConfig in, hide it
)

// ─── Task 4: a test layer you can inspect ───────────────────────────────
const MailerTest: Layer.Layer<Mailer | Outbox> = Layer.effect(
  Mailer,
  Effect.gen(function*() {
    const outbox = yield* Outbox
    return Mailer.of({ send: (to) => Ref.update(outbox, (all) => [...all, to]) })
  })
).pipe(Layer.provideMerge(Outbox.layer)) // feed Outbox in, AND keep it visible to the test

const testLayer: Layer.Layer<UserRepo | Mailer | Outbox> = Layer.merge(UserRepo.layer, MailerTest)

// ─── Checks ─────────────────────────────────────────────────────────────
const sentTo = Effect.gen(function*() {
  const outbox = yield* Outbox
  return yield* Ref.get(outbox)
})

section("Task 1 + 3: the live app")
console.log("  ℹ️  type-level checks: run `npx tsc -p lessons/05-dependency-injection`")
await expectSuccess(
  "signUp succeeds with the live layer (look for the log line)",
  signUp("ada@example.com").pipe(Effect.provide(liveLayer)),
  { email: "ada@example.com" }
)

section("Task 4: the same logic against the test layer")
await expectSuccess(
  "signUp sends exactly one welcome mail, recorded in the Outbox",
  Effect.gen(function*() {
    yield* signUp("ada@example.com")
    return yield* sentTo
  }).pipe(Effect.provide(testLayer)),
  ["ada@example.com"]
)
await expectFailure(
  "signing up twice fails with EmailTaken",
  Effect.gen(function*() {
    yield* signUp("lin@example.com")
    yield* signUp("lin@example.com")
  }).pipe(Effect.provide(testLayer)),
  "EmailTaken"
)
await expectSuccess(
  "a rejected sign-up sends no mail",
  Effect.gen(function*() {
    yield* signUp("lin@example.com")
    yield* Effect.exit(signUp("lin@example.com")) // run it, ignore the outcome
    return yield* sentTo
  }).pipe(Effect.provide(testLayer)),
  ["lin@example.com"]
)

summary()
