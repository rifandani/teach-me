// Lesson 6: Effect.all with and without concurrency.
import { Effect } from "effect"

const task = (id: number) =>
  Effect.gen(function*() {
    yield* Effect.sleep("100 millis")
    return id
  })

const time = <A, E>(label: string, effect: Effect.Effect<A, E>) =>
  Effect.gen(function*() {
    const start = Date.now()
    const result = yield* effect
    console.log(label, result, `${Math.round((Date.now() - start) / 100) * 100}ms`)
  })

const tasks = [task(1), task(2), task(3), task(4)]

await Effect.runPromise(
  Effect.gen(function*() {
    yield* time("sequential (default):", Effect.all(tasks)) // ~400ms
    yield* time("concurrency 2:      ", Effect.all(tasks, { concurrency: 2 })) // ~200ms
    yield* time("unbounded:          ", Effect.all(tasks, { concurrency: "unbounded" })) // ~100ms
    // Effect.forEach is the "map over a list" version
    yield* time("forEach:            ", Effect.forEach([1, 2, 3], task, { concurrency: 3 })) // ~100ms
  })
)
