// Lesson 4 exercise: errors you can see.
//
//   Run the checks:   node lessons/04-error-handling/exercise.ts
//   Type-level check: npx tsc -p lessons/04-error-handling      (no output = correct)
//
// Replace every todo() and TODO below until everything passes.
// Stuck for more than a few minutes? Ask your teacher, or peek at solution.ts.
import { Cause, Data, Effect, Exit } from "effect"
import { check, expectFailure, expectSuccess, section, summary, todo, type Equal, type Expect } from "../../assets/check.ts"

type TODO = "TODO: replace me"

class OutOfStock extends Data.TaggedError("OutOfStock")<{ readonly sku: string }> {}
class CardDeclined extends Data.TaggedError("CardDeclined")<{ readonly reason: string }> {}
class ConfigMissing extends Data.TaggedError("ConfigMissing")<{ readonly key: string }> {}

// ─── 1. Fail with a tagged error ────────────────────────────────────────
// reserve("sold-out") must fail with an OutOfStock error (for that sku).
// Any other sku succeeds with `reserved ${sku}`, e.g. "reserved book".
const reserve = (sku: string): Effect.Effect<string, OutOfStock> => todo()

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
// Start from checkout(sku, card). If it fails with OutOfStock, succeed with "added to waitlist".
// Leave CardDeclined alone. Then write down which error is left in E (predict first!).
const checkoutOrWaitlist = (sku: string, card: string) => todo()

type Remaining = TODO
export type _remaining = Expect<Equal<ReturnType<typeof checkoutOrWaitlist>, Effect.Effect<string, Remaining>>>

// ─── 3. Handle every error with catchTags ───────────────────────────────
// Recover from BOTH errors with one catchTags call:
//   OutOfStock   → succeed with "added to waitlist"
//   CardDeclined → succeed with `payment failed: ${reason}`
// The annotation Effect.Effect<string> means E = never: the compiler checks you handled everything.
const safeCheckout = (sku: string, card: string): Effect.Effect<string> => todo()

// ─── 4. Turn a "can't happen" failure into a defect ─────────────────────
// Given: reading config fails if the key is missing. At startup, that means the app is
// misconfigured, and no caller can sensibly recover, so it should be a defect.
const readConfig: Effect.Effect<string, ConfigMissing> = Effect.fail(new ConfigMissing({ key: "API_URL" }))

// Turn readConfig's expected error into a defect, so E becomes never.
const configOrDie: Effect.Effect<string> = todo()

// ─── Checks (no need to edit below) ─────────────────────────────────────
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
