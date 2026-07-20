import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const toggleAmenityListedSchema = z.object({
  isListed: z.boolean(),
});

export function validateToggleAmenityListedRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = toggleAmenityListedSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Invalid listed status.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
