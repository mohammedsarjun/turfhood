import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'A reset token is required.'),
  newPassword: z.string().min(1, 'A new password is required.'),
});

export function validateResetPasswordRequest(req: Request, res: Response, next: NextFunction): void {
  const result = resetPasswordSchema.safeParse(req.body);
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
