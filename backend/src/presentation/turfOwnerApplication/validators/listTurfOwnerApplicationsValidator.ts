import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const listTurfOwnerApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export type ListTurfOwnerApplicationsQuery = z.infer<typeof listTurfOwnerApplicationsQuerySchema>;

export interface ListTurfOwnerApplicationsRequest extends Request {
  validatedQuery?: ListTurfOwnerApplicationsQuery;
}

/** Express 5 makes `req.query` a getter with no setter — validated data flows via a separate property. */
export function validateListTurfOwnerApplicationsRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = listTurfOwnerApplicationsQuerySchema.safeParse(req.query);
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Invalid list parameters.', errors: result.error.flatten().fieldErrors });
    return;
  }
  (req as ListTurfOwnerApplicationsRequest).validatedQuery = result.data;
  next();
}
