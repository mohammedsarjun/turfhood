import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const createAmenitySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(50),
});

/** Presentation-layer shape check — re-checked in the use case too. */
export function validateCreateAmenityRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = createAmenitySchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Invalid amenity.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
