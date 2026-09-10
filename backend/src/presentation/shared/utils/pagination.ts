/** Normalize untrusted query values before passing them to database pagination. */
export function parsePagination(
  query: { page?: unknown; limit?: unknown },
  defaultLimit = 20,
  maxLimit = 50,
) {
  const integer = (value: unknown, fallback: number) => {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) return fallback;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
  };
  return {
    page: integer(query.page, 1),
    limit: Math.min(maxLimit, integer(query.limit, defaultLimit)),
  };
}
