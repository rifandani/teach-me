// Lesson 6: retries with Schedule; timeouts.
import { Data, Effect, Schedule } from "effect"

class Flaky extends Data.TaggedError("Flaky")<{ readonly attempt: number }> {}

let attempt = 0
const callApi = Effect.suspend(() => {
  attempt++
  console.log(`attempt ${attempt}`)
  return attempt < 3 ? Effect.fail(new Flaky({ attempt })) : Effect.succeed("ok")
})

// Retry up to 5 times with exponential backoff starting at 10ms.
// Schedule.max([...]) continues while ALL schedules continue (v3: Schedule.intersect / both)
const policy = Schedule.max([Schedule.exponential("10 millis"), Schedule.recurs(5)])

console.log(await Effect.runPromise(callApi.pipe(Effect.retry(policy)))) // "ok" on attempt 3

// Simple option form: retry N times
attempt = 0
console.log(await Effect.runPromise(callApi.pipe(Effect.retry({ times: 5 }))))

// Timeout: fail with Cause.TimeoutError if it takes longer than the limit
const slow = Effect.sleep("1 second").pipe(Effect.as("late"))
const exit = await Effect.runPromiseExit(slow.pipe(Effect.timeout("50 millis")))
console.log(exit._tag) // "Failure" (TimeoutError)
