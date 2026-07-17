import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  otp: z.string().trim().length(6, 'Enter the 6-digit code.').regex(/^\d{6}$/, 'Code must be 6 digits.'),
  purpose: z.enum(['signup', 'login']),
});

export function validateVerifyOtpRequest(req: Request, res: Response, next: NextFunction): void {
  const result = verifyOtpSchema.safeParse(req.body);
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
