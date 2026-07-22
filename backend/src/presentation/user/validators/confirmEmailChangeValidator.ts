import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

export const confirmEmailChangeSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, 'Enter the 6-digit code.')
    .regex(/^\d{6}$/, 'Code must be 6 digits.'),
});

export function validateConfirmEmailChangeRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = confirmEmailChangeSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: 'Invalid request.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
