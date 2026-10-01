// Lesson 5 exercise: dependency injection with services and Layers.
//
//   Run the checks:   node lessons/05-dependency-injection/exercise.ts
//   Type-level check: npx tsc -p lessons/05-dependency-injection      (no output = correct)
//
// A tiny sign-up feature. Replace every todo() and todoLayer() below until everything passes.
// Stuck for more than a few minutes? Ask your teacher, or peek at solution.ts.
import { Context, Data, Effect, Layer, Ref } from "effect"
import { expectFailure, expectSuccess, section, summary, todo, todoLayer, type Equal, type Expect } from "../../assets/check.ts"

// ─── Given: the domain ──────────────────────────────────────────────────
interface User {
  readonly email: string
}
class EmailTaken extends Data.TaggedError("EmailTaken")<{ readonly email: string }> {}

// ─── Given: services (worked examples, read them) ───────────────────────
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
// Replace todoLayer() with a Layer.effect(Mailer, …) that reads SmtpConfig (yield* SmtpConfig)
// and returns Mailer.of({ send }). `send` should Effect.log a line that includes config.host.
// Keep send's own requirements at never: the dependency belongs to the layer, not the method.
class Mailer extends Context.Service<Mailer, {
  readonly send: (to: string, body: string) => Effect.Effect<void>
}>()("lesson5/Mailer") {
  static readonly layer: Layer.Layer<Mailer, never, SmtpConfig> = todoLayer("Task 2: build Mailer.layer")
}

// ─── Task 1: business logic that only knows the interfaces ──────────────
// signUp(email) must:
//   1. fail with EmailTaken if the repo already has the email (and send no mail)
//   2. otherwise insert the user, send them "Welcome!", and succeed with the User
// Get the services with yield*. Don't import any implementation.
const signUp = Effect.fn("signUp")(function*(email: string) {
  return yield* todo<User>("Task 1: write signUp")
})

// Predict first: what will R and E be once signUp is written? These lines check you.
export type _requirements = Expect<Equal<Effect.Services<ReturnType<typeof signUp>>, UserRepo | Mailer>>
export type _errors = Expect<Equal<Effect.Error<ReturnType<typeof signUp>>, EmailTaken>>

// ─── Task 3: compose the "live" app layer ───────────────────────────────
// Combine UserRepo.layer with Mailer.layer. Mailer.layer still needs SmtpConfig, so feed it in.
// (The annotation won't compile while SmtpConfig is still required. That's the point.)
const liveLayer: Layer.Layer<UserRepo | Mailer> = todoLayer("Task 3: compose liveLayer")

// ─── Task 4: a test layer you can inspect ───────────────────────────────
// MailerTest: a Mailer whose send appends `to` to the Outbox Ref (Ref.update) instead of logging.
// The test reads the Outbox afterwards, so the Outbox must stay in the layer's OUTPUT.
// Which of Layer.provide / Layer.provideMerge keeps it there?
const MailerTest: Layer.Layer<Mailer | Outbox> = todoLayer("Task 4: build MailerTest")

const testLayer: Layer.Layer<UserRepo | Mailer | Outbox> = Layer.merge(UserRepo.layer, MailerTest)

// ─── Checks (no need to edit below) ─────────────────────────────────────
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
