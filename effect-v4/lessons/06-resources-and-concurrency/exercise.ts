// Lesson 6 exercise: resources, concurrency, timeouts and retries.
//
//   Run the checks:   node lessons/06-resources-and-concurrency/exercise.ts
//   Type-level check: npx tsc -p lessons/06-resources-and-concurrency      (no output = correct)
//
// Replace every todo() and TODO below until everything passes.
// Stuck for more than a few minutes? Ask your teacher, or peek at solution.ts.
import { Data, Effect, Schedule, Scope } from "effect"
import { check, expectFailure, expectSuccess, section, summary, todo, type Equal, type Expect } from "../../assets/check.ts"

type TODO = "TODO: replace me"

// ─── 1. Resources that always get released ──────────────────────────────
// openResource must push `open ${name}` to resourceLog when acquired, push `close ${name}`
// when released, and succeed with `name`. Use Effect.acquireRelease (note the Scope in R).
// Then make safeProgram: `program` with its Scope provided, so it can run.
class DiskFull extends Data.TaggedError("DiskFull")<{}> {}

const resourceLog: Array<string> = []

const openResource = (name: string): Effect.Effect<string, never, Scope.Scope> => todo()

const program = Effect.gen(function*() {
  yield* openResource("db")
  yield* openResource("cache")
  return yield* new DiskFull() // fails halfway: both resources are still open here
})

const safeProgram: Effect.Effect<never, DiskFull> = todo()

// ─── 2. Bounded concurrency ─────────────────────────────────────────────
// Run `job` for ids [1, 2, 3, 4] with AT MOST 2 jobs running at once.
// (Careful: with no options, Effect runs them one at a time.)
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

const allJobs: Effect.Effect<ReadonlyArray<number>> = todo()

// ─── 3. Retry with a Schedule ───────────────────────────────────────────
// flakyCall always fails. Retry it with exponential backoff starting at 5 millis,
// giving up after 3 retries. Combine two schedules with Schedule.max([...]).
class Flaky extends Data.TaggedError("Flaky")<{ readonly attempt: number }> {}

let attempts = 0
const flakyCall: Effect.Effect<string, Flaky> = Effect.suspend(() => {
  attempts++
  return Effect.fail(new Flaky({ attempt: attempts }))
})

const withRetry: Effect.Effect<string, Flaky> = todo()

// ─── 4. Timeout with a fallback ─────────────────────────────────────────
// (a) Predict the error type that Effect.timeout adds, then check with tsc.
// (b) Build withFallback from timedOut: when it times out, succeed with "cached" instead.
const lookupLog: Array<string> = []
const slowLookup = Effect.sleep("200 millis").pipe(
  Effect.as("fresh"),
  Effect.onInterrupt(() => Effect.sync(() => lookupLog.push("lookup interrupted")))
)

const timedOut = slowLookup.pipe(Effect.timeout("20 millis"))
type TimedOutError = TODO
export type _timedOut = Expect<Equal<Effect.Effect<string, TimedOutError>, typeof timedOut>>

const withFallback: Effect.Effect<string> = todo()

// ─── Checks (no need to edit below) ─────────────────────────────────────
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
