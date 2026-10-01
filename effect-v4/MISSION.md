# Mission: Effect v4

## Why
Decide, with evidence rather than hype, whether Effect v4 is worth adopting for my TypeScript work, and be able to explain that verdict (and its trade-offs) to my team.

## Success looks like
- I can read any `Effect<A, E, R>` signature and real v4 code without looking things up
- I can explain, with a concrete before/after, what Effect gives over plain TypeScript (typed errors, dependency injection, interruption, resource safety, retries) and what it costs
- I can rewrite a small plain-TS service in Effect with tagged errors, a service + Layer, and a test that swaps the Layer
- I can spot a v3-era tutorial or LLM answer and translate it to v4
- I can write a one-page adopt / pilot / skip recommendation with the trade-offs and a plan to try it at the edges of an existing codebase

## Constraints
- New to Effect; comfortable with TypeScript
- Preferred format: short HTML lesson + quiz + a runnable `.ts` exercise per lesson folder
- Target: `effect@4.0.0` (stable since 2026-10-01)

## Out of scope
- Deep dives into the unstable modules (`effect/http`, `sql`, `ai`, `rpc`, `cluster`, `workflow`): mentioned only, not taught
- Streams, STM (`Tx*`), and Effect internals
- Migrating an existing v3 codebase
