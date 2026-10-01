# Effect v4 Resources

Primary-source research notes behind this course: [research/effect-v4.md](./research/effect-v4.md). Every snippet in it was typechecked and run against `effect@4.0.0` (snippets in [research/snippets/](./research/snippets/)).

## Knowledge

- [Docs: Effect v4 documentation](https://effect.website/docs/v4)
  Official docs. Onboarding → The Effect Type → Creating Effects → Errors → Services/Layers → Concurrency. Append `.md` to any page URL for raw Markdown. Use for: every lesson's primary reading.
- [Docs: The Effect Type](https://effect.website/docs/v4/getting-started/the-effect-type)
  The lazy-description model and the A / E / R channels. Use for: lesson 1.
- [Docs: Onboarding / Why Effect](https://effect.website/docs/v4/onboarding)
  The project's own case for Effect over plain TS. Use for: lesson 2, the "pro" side of the adoption ledger.
- [Blog: "Effect 4.0" release post (Sep 30, 2026)](https://effect.website/blog/releases/effect/40)
  What changed, performance figures, and the LTS policy (support until at least Sept 2029). Use for: lesson 8, adoption risk.
- [Repo: MIGRATION.md (v3 → v4)](https://github.com/Effect-TS/effect/blob/main/MIGRATION.md)
  Official migration guide plus per-topic pages in `migration/`. Use for: spotting outdated v3 tutorials.
- [Repo: migration/v3-to-v4.md](https://github.com/Effect-TS/effect/blob/main/migration/v3-to-v4.md)
  Generated rename map for every v3 API. Huge; search it. Use for: "what is X called in v4?"
- [Repo: LLMS.md](https://github.com/Effect-TS/effect/blob/main/LLMS.md)
  The maintainers' concise house-style guide (`Effect.gen`/`Effect.fn`, `Context.Service`, `Schema.TaggedError`, layers). Use for: "how is idiomatic v4 written?"
- [Repo: ai-docs/src](https://github.com/Effect-TS/effect/tree/main/ai-docs/src)
  Small, typechecked example files per topic. Use for: more worked examples after each lesson.
- [Repo: SCHEMA.md](https://github.com/Effect-TS/effect/blob/main/packages/effect/SCHEMA.md)
  The full Schema v4 guide. Use for: lesson 7 and beyond.
- [Docs: Myths](https://effect.website/myths/)
  Official answers to "is it slow / big / hard to learn?". ⚠️ Not yet updated for v4 (uses `catchAll`, `Either`, a v3 bundle figure). Use for: lesson 8, with care.
- [Docs: Devtools (`@effect/tsgo`)](https://effect.website/docs/v4/getting-started/devtools)
  Effect language-service diagnostics (floating effects, leaked requirements). Needs TypeScript 7. Use for: once you write real code.

## Wisdom (Communities)

- [Effect Discord](https://discord.gg/effect-ts)
  Official; the core team and experienced users answer daily. Use for: "is this idiomatic?", adoption stories from teams who have done it, and sanity-checking your lesson-8 verdict.
- [GitHub Issues: Effect-TS/effect](https://github.com/Effect-TS/effect/issues)
  v4 lives on `main`. Use for: bugs and confirming whether a doc gap is a known issue.

## Gaps

- No independent (non-maintainer) primary source on the real-world cost of adopting Effect in a team. Treat any "it spreads through the codebase" claims as community opinion and test them in the Discord.
- Not verified whether the official playground and workshop videos target v4 or v3.
