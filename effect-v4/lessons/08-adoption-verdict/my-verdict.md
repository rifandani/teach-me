# My Effect v4 verdict

> Fill this in after lesson 8, then paste it to your teacher for a critique.
> Write a claim only when you can back it with something you saw: a lesson, an exercise, a source, or your own codebase.

**Date:** YYYY-MM-DD · **Effect version evaluated:** 4.0.0 · **Author:**

## 1. Context

- **Codebase:** what it is (API / worker / CLI / frontend), its size, and its runtime (Node / Bun / browser)
- **Where it hurts today:** for example, untyped `catch (e)`, hand-rolled retries, global singletons that are hard to mock, leaked connections, missing tracing
- **Team:** size, TypeScript experience, how much time there is for learning, whether someone would champion Effect
- **Modules we would rely on:** core only (`Effect`, `Layer`, `Context`, `Schema`)? Or unstable ones (`effect/http`, `sql`, `ai`, …)?

## 2. Ledger

Copy the points you still agree with from each lesson's *Adoption lens* box, then add your own.

| Lesson | Pro (evidence) | Cost (evidence) |
|---|---|---|
| 1 Mental model | | |
| 2 Why Effect | | |
| 3 Building programs | | |
| 4 Error handling | | |
| 5 Dependency injection | | |
| 6 Resources & concurrency | | |
| 7 Schema & toolbox | | |
| 8 Adoption risk | | |

## 3. Decision

- [ ] **Adopt:** use it for new services by default
- [ ] **Pilot:** try it on one bounded service at the edge, then decide
- [ ] **Skip:** not now (say what would change your mind)

**Why, in three sentences:**

## 4. Pilot plan (if you chose Pilot or Adopt)

- **Candidate:** one bounded piece with real failure modes, e.g. an outbound API integration, a queue worker, or one route handler
- **How it plugs in:** a `ManagedRuntime` built from its Layer, called from the existing handler. The rest of the app is unchanged.
- **Timebox:**
- **How to back out:** the handler signature stays the same, so reverting means swapping the function body back

## 5. Success criteria

Decide these *before* the pilot starts.

- [ ] Error cases are visible in types and handled by tag (count the handled cases: before / after)
- [ ] Tests swap a Layer instead of mocking modules
- [ ] Retries and timeouts are declared, not hand-written
- [ ] Teammates can read the code after a short walkthrough
- [ ] No regressions in bundle size or latency that matter for us
- [ ] Other:

## 6. Open questions for the Effect Discord

Ask practitioners: <https://discord.gg/effect-ts>

1. 
2. 
3. 
