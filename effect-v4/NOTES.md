# Teacher notes

## Learner preferences
- Wants to go step by step, starting from the mental model, as someone new to Effect.
- Goal is evaluative (judge adoption), so every lesson ends with an "Adoption lens" box that adds to a pro/cost ledger; lesson 8 turns the ledger into a verdict.
- Format: one folder per lesson in `lessons/NN-name/` containing `index.html` (lesson + quiz), `exercise.ts` (self-checking), `solution.ts`, `tsconfig.json`.

## Course conventions
- Target `effect@4.0.0`. Never teach a v3 name without labelling it v3 in a `.box.v3` callout.
- Canonical terms (use these exact words in every lesson; promote to GLOSSARY.md once the learner shows they understand them):
  - **Effect**: a lazy, immutable description of a program, `Effect<A, E, R>`. Avoid "task", "promise-like".
  - **success / error / requirements channel** (A, E, R). Avoid "context channel" for R.
  - **run at the edge**: calling `run*` once at the entry point.
  - **expected error** vs **defect**. Avoid "exception" for expected errors.
  - **tagged error**, **service**, **service key** (the `Context.Service` class), **Layer**, **provide**.
  - **Scope**, **finalizer**, **fiber**, **interruption**, **Schedule**, **Schema**, **decode**.
- Exercise loop: `node lessons/NN-name/exercise.ts` (runtime ✅/❌) and `npx tsc -p lessons/NN-name` (type-level checks). `npm run typecheck` verifies every solution.

## Research flags to keep in mind
- `Effect.andThen` / `Effect.tap` only accept Effects in v4 (not in migration docs). Mention in lesson 3.
- The website Myths page and blog footer API link are stale (v3).
- `Data.TaggedError` (website docs) vs `Schema.TaggedError` (maintainers' LLMS.md): teach Data first, Schema in lesson 7.

## Components in assets/
- `course.css`: shared styles (boxes: win / v3 / tip / adopt / ask / source; `.compare`, `.anatomy`, `.recall`, `.quiz`, `.exercise`, `.cmd`, `.toc`).
- `course.js`: quiz (shuffles options, first-try score), copy buttons, highlight.js from cdnjs.
- `check.ts`: exercise kit (`todo`, `todoLayer`, `todoValue`, `check`, `expectSuccess`, `expectFailure`, `section`, `summary`, `Equal`/`Expect`).

## Next session
- Start with a spaced quiz on the lessons the learner has finished, then go by the learning records.
- When the learner fills in `lessons/08-adoption-verdict/my-verdict.md`, critique it against the ledger and the research.
