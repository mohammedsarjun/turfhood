import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

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
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: 'Invalid listed status.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
