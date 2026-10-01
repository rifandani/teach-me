// Lesson 5: Layers are recipes for building services (possibly from other services).
import { Context, Effect, Layer } from "effect"
import type { Equal, Expect } from "./_type-test.ts"

class Config extends Context.Service<Config, { readonly dbUrl: string }>()("app/Config") {
  // Layer.succeed: a service from a plain value
  static readonly layer = Layer.succeed(Config, { dbUrl: "postgres://localhost/app" })
}

class Database extends Context.Service<Database, {
  readonly query: (sql: string) => Effect.Effect<string>
}>()("app/Database") {
  // Layer.effect: build the service with an Effect that may use other services
  static readonly layerNoDeps = Layer.effect(
    Database,
    Effect.gen(function*() {
      const config = yield* Config // dependency is used at construction time...
      yield* Effect.log(`connecting to ${config.dbUrl}`)
      return Database.of({ query: (sql) => Effect.succeed(`rows for "${sql}"`) })
    })
  )
  // ...and wired with Layer.provide, so it never leaks into Database's methods
  static readonly layer = this.layerNoDeps.pipe(Layer.provide(Config.layer))
}

type _1 = Expect<Equal<typeof Database.layerNoDeps, Layer.Layer<Database, never, Config>>>
type _2 = Expect<Equal<typeof Database.layer, Layer.Layer<Database, never, never>>>

// provideMerge: provide Config to Database AND keep Config in the output
const both = Database.layerNoDeps.pipe(Layer.provideMerge(Config.layer))
type _3 = Expect<Equal<typeof both, Layer.Layer<Database | Config, never, never>>>

// merge: combine independent layers side by side
const merged = Layer.merge(Config.layer, Database.layer)
type _4 = Expect<Equal<typeof merged, Layer.Layer<Config | Database, never, never>>>

const program = Effect.gen(function*() {
  const db = yield* Database
  return yield* db.query("SELECT * FROM users")
})

console.log(await Effect.runPromise(program.pipe(Effect.provide(Database.layer))))
