import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

export const updateAmenitySchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(50).optional(),
    icon: z.string().trim().max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required.' });

export function validateUpdateAmenityRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = updateAmenitySchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: 'Invalid amenity.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
