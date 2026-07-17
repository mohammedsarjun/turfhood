import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  purpose: z.enum(['signup', 'login']),
});

export function validateSendOtpRequest(req: Request, res: Response, next: NextFunction): void {
  const result = sendOtpSchema.safeParse(req.body);
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
