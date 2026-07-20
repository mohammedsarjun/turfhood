import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const toggleSportsTypeListedSchema = z.object({
  isListed: z.boolean(),
});

export function validateToggleSportsTypeListedRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = toggleSportsTypeListedSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Invalid listed status.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
