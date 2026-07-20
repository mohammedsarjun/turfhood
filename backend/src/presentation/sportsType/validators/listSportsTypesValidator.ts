import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const listSportsTypesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  isListed: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type ListSportsTypesQuery = z.infer<typeof listSportsTypesQuerySchema>;

export interface ListSportsTypesRequest extends Request {
  validatedQuery?: ListSportsTypesQuery;
}

/**
 * Express 5 makes `req.query` a getter with no setter — assigning to it (as the pre-5
 * convention did) is silently a no-op, so the coerced/defaulted values must be handed off via
 * a separate property instead of overwriting req.query.
 */
export function validateListSportsTypesRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = listSportsTypesQuerySchema.safeParse(req.query);
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Invalid list parameters.', errors: result.error.flatten().fieldErrors });
    return;
  }
  (req as ListSportsTypesRequest).validatedQuery = result.data;
  next();
}
