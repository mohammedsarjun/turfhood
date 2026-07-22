import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export function validateRequestPasswordResetRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = requestPasswordResetSchema.safeParse(req.body);
  if (!result.success) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Invalid request.',
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }
  req.body = result.data;
  next();
}
