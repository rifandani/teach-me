// Lesson 5: test by swapping the layer — business logic doesn't change.
import { Context, Effect, Layer, Ref } from "effect"

class Mailer extends Context.Service<Mailer, {
  readonly send: (to: string, body: string) => Effect.Effect<void>
}>()("app/Mailer") {
  static readonly layer = Layer.succeed(Mailer, {
    send: (to, body) => Effect.log(`(real SMTP) to=${to} body=${body}`)
  })
}

// Business logic depends only on the Mailer interface
const signUp = Effect.fn("signUp")(function*(email: string) {
  const mailer = yield* Mailer
  yield* mailer.send(email, "Welcome!")
  return { email }
})

// A test layer that records sent mail in memory
class SentMail extends Context.Service<SentMail, Ref.Ref<ReadonlyArray<string>>>()("test/SentMail") {}

const MailerTest = Layer.effect(
  Mailer,
  Effect.gen(function*() {
    const sent = yield* SentMail
    return Mailer.of({ send: (to) => Ref.update(sent, (all) => [...all, to]) })
  })
).pipe(Layer.provideMerge(Layer.effect(SentMail, Ref.make<ReadonlyArray<string>>([]))))

const test = Effect.gen(function*() {
  yield* signUp("ada@example.com")
  const sent = yield* Ref.get(yield* SentMail)
  if (sent.length !== 1 || sent[0] !== "ada@example.com") throw new Error("test failed")
  return "test passed"
})

console.log(await Effect.runPromise(test.pipe(Effect.provide(MailerTest))))
await Effect.runPromise(signUp("lin@example.com").pipe(Effect.provide(Mailer.layer)))
