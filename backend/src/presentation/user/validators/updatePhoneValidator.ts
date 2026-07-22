import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

export const updatePhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number.'),
});

export function validateUpdatePhoneRequest(req: Request, res: Response, next: NextFunction): void {
  const result = updatePhoneSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: 'Invalid phone number.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
