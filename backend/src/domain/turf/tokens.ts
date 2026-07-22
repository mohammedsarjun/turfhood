/** DI tokens identifying the turf module's ports, resolved by the composition root. */
export const TURF_TOKENS = {
  TurfRepository: Symbol('ITurfRepository'),
  TurfImageRepository: Symbol('ITurfImageRepository'),
} as const;
