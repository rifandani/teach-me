// Lesson 1: an Effect is a lazy *description*; a Promise is an eager *running* computation.
import { Effect } from "effect"

const promise = new Promise<number>((resolve) => {
  console.log("Promise body runs immediately")
  resolve(1)
})

const effect = Effect.sync(() => {
  console.log("Effect body runs only when the Effect is run")
  return 1
})

console.log("--- nothing has run the Effect yet ---")

// Running happens "at the edge" of the program:
const a = Effect.runSync(effect) // runs it once
const b = Effect.runSync(effect) // runs it again: an Effect is a reusable recipe
console.log(a + b) // 2

await promise
