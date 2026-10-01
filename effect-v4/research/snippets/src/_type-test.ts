// Tiny compile-time assertion helpers (no runtime effect).
// `Expect<Equal<A, B>>` fails to typecheck unless A and B are identical types.
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
export type Expect<T extends true> = T
