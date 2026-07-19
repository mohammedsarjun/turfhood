import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

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
    res.status(400).json({
      message: 'Invalid request.',
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }
  req.body = result.data;
  next();
}
