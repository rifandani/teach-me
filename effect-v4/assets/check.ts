// Self-check kit shared by every lesson exercise.
// Each check prints ✅ (pass), ❌ (wrong) or ⬜ (todo() not replaced yet) immediately; `summary()` prints the score and sets the exit code.
import { Cause, Effect, Exit, Layer, Option } from "effect"
import { inspect, isDeepStrictEqual } from "node:util"

// Compile-time assertions: `Expect<Equal<A, B>>` only typechecks when A and B are the same type.
// Verify them with `npx tsc -p lessons/<folder>`.
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
export type Expect<T extends true> = T

let passed = 0
let failed = 0

const show = (value: unknown) => inspect(value, { depth: 4, breakLength: Infinity })

const pass = (label: string) => {
  passed++
  console.log(`  ✅ ${label}`)
}

// A todo() that was never replaced: report it in one line instead of a stack trace.
const TODO_PREFIX = "TODO: "
const todoHint = (cause: Cause.Cause<unknown>): string | undefined => {
  for (const reason of cause.reasons) {
    if (Cause.isDieReason(reason) && reason.defect instanceof Error && reason.defect.message.startsWith(TODO_PREFIX)) {
      return reason.defect.message.slice(TODO_PREFIX.length)
    }
  }
  return undefined
}

// Failure details without stack frames: keep the message lines, drop "    at …" lines.
const describe = (cause: Cause.Cause<unknown>): string =>
  Cause.pretty(cause).split("\n").filter((line) => !/^\s+at /.test(line)).join("\n")

const notDone = (label: string, hint: string) => {
  failed++
  console.log(`  ⬜ ${label}\n     not done yet: ${hint}`)
}

const fail = (label: string, detail: string) => {
  failed++
  console.log(`  ❌ ${label}\n     ${detail.split("\n").join("\n     ")}`)
}

/** A placeholder you replace with your answer. It typechecks as any Effect and dies when run. */
export const todo = <A = never, E = never, R = never>(hint = "replace this todo()"): Effect.Effect<A, E, R> =>
  Effect.die(new Error(TODO_PREFIX + hint))

/** A placeholder for a Layer you still have to write. It typechecks as any Layer; building it dies. */
export const todoLayer = <ROut, E = never, RIn = never>(hint = "replace this todoLayer()"): Layer.Layer<ROut, E, RIn> =>
  Layer.effectDiscard(todo(hint)) as unknown as Layer.Layer<ROut, E, RIn>

/** A placeholder for a plain (non-Effect) value. Checks on it fail with "got undefined" until replaced. */
export const todoValue = <A>(): A => undefined as A

export const section = (title: string) => console.log(`\n${title}`)

export const check = (label: string, actual: unknown, expected: unknown): void =>
  isDeepStrictEqual(actual, expected) ? pass(label) : fail(label, `expected ${show(expected)}\n got      ${show(actual)}`)

/** Runs the effect and passes if it succeeds with `expected`. */
export const expectSuccess = async <A, E>(label: string, effect: Effect.Effect<A, E>, expected: A): Promise<void> => {
  const exit = await Effect.runPromiseExit(effect)
  if (Exit.isSuccess(exit)) return check(label, exit.value, expected)
  const hint = todoHint(exit.cause)
  if (hint !== undefined) return notDone(label, hint)
  fail(label, `expected success with ${show(expected)}, but it failed:\n${describe(exit.cause)}`)
}

/** Runs the effect and passes if it fails with an expected error whose `_tag` is `tag`. */
export const expectFailure = async <A, E>(label: string, effect: Effect.Effect<A, E>, tag: string): Promise<void> => {
  const exit = await Effect.runPromiseExit(effect)
  if (Exit.isSuccess(exit)) return fail(label, `expected failure "${tag}", but it succeeded with ${show(exit.value)}`)
  const hint = todoHint(exit.cause)
  if (hint !== undefined) return notDone(label, hint)
  const error = Cause.findErrorOption(exit.cause)
  if (Option.isNone(error)) return fail(label, `expected failure "${tag}", but there was no typed error:\n${describe(exit.cause)}`)
  const actualTag = (error.value as { _tag?: unknown })?._tag
  actualTag === tag ? pass(label) : fail(label, `expected failure "${tag}", got ${show(error.value)}`)
}

export const summary = (): void => {
  const total = passed + failed
  console.log(
    failed === 0
      ? `\n${passed}/${total} checks passed. Lesson complete 🎉`
      : `\n${passed}/${total} checks passed. Fix the ⬜ / ❌ above and run again.`
  )
  if (failed > 0) process.exitCode = 1
}
