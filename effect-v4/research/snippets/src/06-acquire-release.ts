// Lesson 6: resource safety with acquireRelease + Scope. Release ALWAYS runs (success, failure, interruption).
import { Console, Effect } from "effect"

const openFile = (name: string) =>
  Effect.acquireRelease(
    Console.log(`open ${name}`).pipe(Effect.as({ name })), // acquire
    (file, exit) => Console.log(`close ${file.name} (exit: ${exit._tag})`) // release
  ) // Effect<{ name: string }, never, Scope>  <- needs a Scope

const program = Effect.gen(function*() {
  const a = yield* openFile("a.txt")
  const b = yield* openFile("b.txt")
  yield* Console.log(`using ${a.name} and ${b.name}`)
  return yield* Effect.fail("disk full") // even on failure, both files are closed
})

// Effect.scoped provides a Scope and closes it when the program ends (releases in reverse order)
const exit = await Effect.runPromiseExit(Effect.scoped(program))
console.log(exit._tag) // "Failure"
