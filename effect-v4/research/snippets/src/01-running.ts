// Lesson 1: the run* functions ("the edge" of your program).
import { Effect, Exit } from "effect"

const ok = Effect.succeed(21).pipe(Effect.map((n) => n * 2))
const bad = Effect.fail("nope")

console.log(Effect.runSync(ok)) // 42 (sync only; throws if the effect is async or fails)

console.log(await Effect.runPromise(ok)) // 42

// runPromise rejects when the effect fails:
await Effect.runPromise(bad).catch((e) => console.log("rejected with:", String(e)))

// runPromiseExit / runSyncExit never throw; they give you an Exit value:
const exit = await Effect.runPromiseExit(bad)
console.log(Exit.isFailure(exit)) // true
console.log(Exit.isSuccess(Effect.runSyncExit(ok))) // true
