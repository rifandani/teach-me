// Lesson 4 solution. Run: node lessons/04-error-handling/solution.ts
import { Cause, Data, Effect, Exit } from "effect"
import { check, expectFailure, expectSuccess, section, summary, type Equal, type Expect } from "../../assets/check.ts"

class OutOfStock extends Data.TaggedError("OutOfStock")<{ readonly sku: string }> {}
class CardDeclined extends Data.TaggedError("CardDeclined")<{ readonly reason: string }> {}
class ConfigMissing extends Data.TaggedError("ConfigMissing")<{ readonly key: string }> {}

// ─── 1. Fail with a tagged error ────────────────────────────────────────
const reserve = (sku: string): Effect.Effect<string, OutOfStock> =>
  sku === "sold-out" ? Effect.fail(new OutOfStock({ sku })) : Effect.succeed(`reserved ${sku}`)

// Given: charging a card can fail with CardDeclined.
const charge = (card: string): Effect.Effect<string, CardDeclined> =>
  card === "bad" ? Effect.fail(new CardDeclined({ reason: "insufficient funds" })) : Effect.succeed("paid")

// Given: checkout combines both, so both errors show up in E.
const checkout = (sku: string, card: string) =>
  Effect.gen(function*() {
    const reservation = yield* reserve(sku)
    const payment = yield* charge(card)
    return `${reservation}, ${payment}`
  }) // Effect<string, OutOfStock | CardDeclined, never>

// ─── 2. Handle one error with catchTag ──────────────────────────────────
const checkoutOrWaitlist = (sku: string, card: string) =>
  checkout(sku, card).pipe(
    Effect.catchTag("OutOfStock", () => Effect.succeed("added to waitlist"))
  )

type Remaining = CardDeclined
export type _remaining = Expect<Equal<ReturnType<typeof checkoutOrWaitlist>, Effect.Effect<string, Remaining>>>

// ─── 3. Handle every error with catchTags ───────────────────────────────
const safeCheckout = (sku: string, card: string): Effect.Effect<string> =>
  checkout(sku, card).pipe(
    Effect.catchTags({
      OutOfStock: () => Effect.succeed("added to waitlist"),
      CardDeclined: (e) => Effect.succeed(`payment failed: ${e.reason}`)
    })
  )

// ─── 4. Turn a "can't happen" failure into a defect ─────────────────────
// Given: reading config fails if the key is missing. At startup, that means the app is
// misconfigured, and no caller can sensibly recover, so it should be a defect.
const readConfig: Effect.Effect<string, ConfigMissing> = Effect.fail(new ConfigMissing({ key: "API_URL" }))

const configOrDie: Effect.Effect<string> = readConfig.pipe(Effect.orDie)

// ─── Checks ─────────────────────────────────────────────────────────────
section("1. Fail with a tagged error")
await expectSuccess(`reserve("book") succeeds`, reserve("book"), "reserved book")
await expectFailure(`reserve("sold-out") fails with OutOfStock`, reserve("sold-out"), "OutOfStock")

section("2. catchTag handles one error")
await expectSuccess("sold-out item goes to the waitlist", checkoutOrWaitlist("sold-out", "good"), "added to waitlist")
await expectFailure("a declined card still fails with CardDeclined", checkoutOrWaitlist("book", "bad"), "CardDeclined")
console.log("  ℹ️  type-level check: run `npx tsc -p lessons/04-error-handling` (no output = correct)")

section("3. catchTags handles both")
await expectSuccess("happy path", safeCheckout("book", "good"), "reserved book, paid")
await expectSuccess("sold-out → waitlist", safeCheckout("sold-out", "good"), "added to waitlist")
await expectSuccess("declined → message", safeCheckout("book", "bad"), "payment failed: insufficient funds")

section("4. Defects skip Effect.catch")
const tagOf = (u: unknown) => (u as { _tag?: string } | undefined)?._tag ?? String(u)
const caught = await Effect.runPromiseExit(configOrDie.pipe(Effect.catch(() => Effect.succeed("caught"))))
check(
  "Effect.catch does NOT recover it: the run still dies with ConfigMissing",
  Exit.isSuccess(caught) ? `succeeded with ${caught.value}` : Cause.hasDies(caught.cause) ? tagOf(Cause.squash(caught.cause)) : "no defect",
  "ConfigMissing"
)
await expectSuccess(
  "catchDefect at the edge sees the ConfigMissing defect",
  configOrDie.pipe(Effect.catchDefect((defect) => Effect.succeed(tagOf(defect)))),
  "ConfigMissing"
)

summary()
