// Lesson 1 (edge of the program): for Node apps, prefer NodeRuntime.runMain from @effect/platform-node.
// It handles SIGINT/SIGTERM (graceful interruption), sets the exit code, and reports errors.
import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"

const main = Effect.gen(function*() {
  yield* Effect.log("app started")
  yield* Effect.sleep("50 millis")
  yield* Effect.log("app finished")
})

NodeRuntime.runMain(main)
