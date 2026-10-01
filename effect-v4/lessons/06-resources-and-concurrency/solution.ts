// Lesson 6 solution. Run: node lessons/06-resources-and-concurrency/solution.ts
import { Cause, Data, Effect, Schedule, Scope } from "effect"
import { check, expectFailure, expectSuccess, section, summary, type Equal, type Expect } from "../../assets/check.ts"

// ─── 1. Resources that always get released ──────────────────────────────
class DiskFull extends Data.TaggedError("DiskFull")<{}> {}

const resourceLog: Array<string> = []

// acquireRelease pairs "open" with "close". The result needs a Scope (it's in R).
const openResource = (name: string): Effect.Effect<string, never, Scope.Scope> =>
  Effect.acquireRelease(
    Effect.sync(() => {
      resourceLog.push(`open ${name}`)
      return name
    }),
    () => Effect.sync(() => resourceLog.push(`close ${name}`))
  )

const program = Effect.gen(function*() {
  yield* openResource("db")
  yield* openResource("cache")
  return yield* new DiskFull()
})

// Effect.scoped supplies the Scope and closes it when `program` ends, however it ends.
const safeProgram: Effect.Effect<never, DiskFull> = Effect.scoped(program)

// ─── 2. Bounded concurrency ─────────────────────────────────────────────
let inFlight = 0
let maxInFlight = 0

const job = (id: number) =>
  Effect.gen(function*() {
    yield* Effect.sync(() => {
      inFlight++
      maxInFlight = Math.max(maxInFlight, inFlight)
    })
    yield* Effect.sleep("20 millis")
    yield* Effect.sync(() => inFlight--)
    return id * 10
  })

const allJobs: Effect.Effect<ReadonlyArray<number>> = Effect.forEach([1, 2, 3, 4], job, { concurrency: 2 })

// ─── 3. Retry with a Schedule ───────────────────────────────────────────
class Flaky extends Data.TaggedError("Flaky")<{ readonly attempt: number }> {}

let attempts = 0
const flakyCall: Effect.Effect<string, Flaky> = Effect.suspend(() => {
  attempts++
  return Effect.fail(new Flaky({ attempt: attempts }))
})

// Exponential backoff (5ms, 10ms, 20ms …), but at most 3 retries. max([…]) = stop when either stops.
const policy = Schedule.max([Schedule.exponential("5 millis"), Schedule.recurs(3)])
const withRetry: Effect.Effect<string, Flaky> = flakyCall.pipe(Effect.retry(policy))

// ─── 4. Timeout with a fallback ─────────────────────────────────────────
const lookupLog: Array<string> = []
const slowLookup = Effect.sleep("200 millis").pipe(
  Effect.as("fresh"),
  Effect.onInterrupt(() => Effect.sync(() => lookupLog.push("lookup interrupted")))
)

const timedOut = slowLookup.pipe(Effect.timeout("20 millis"))
type TimedOutError = Cause.TimeoutError
export type _timedOut = Expect<Equal<Effect.Effect<string, TimedOutError>, typeof timedOut>>

const withFallback: Effect.Effect<string> = timedOut.pipe(
  Effect.catchTag("TimeoutError", () => Effect.succeed("cached"))
)

// ─── Checks ─────────────────────────────────────────────────────────────
section("1. Resources")
await expectFailure("safeProgram fails with DiskFull", safeProgram, "DiskFull")
check("both resources closed, in reverse order", resourceLog, ["open db", "open cache", "close cache", "close db"])

section("2. Bounded concurrency")
await expectSuccess("allJobs returns results in input order", allJobs, [10, 20, 30, 40])
check("never more than 2 jobs in flight at once", maxInFlight, 2)

section("3. Retry with a Schedule")
await expectFailure("withRetry still fails with Flaky after giving up", withRetry, "Flaky")
check("1 attempt + 3 retries = 4 attempts", attempts, 4)

section("4. Timeout with a fallback")
console.log("  ℹ️  type-level check: run `npx tsc -p lessons/06-resources-and-concurrency` (no output = correct)")
await expectSuccess(`withFallback succeeds with "cached"`, withFallback, "cached")
check("the slow lookup was interrupted, not left running", lookupLog, ["lookup interrupted"])

summary()
