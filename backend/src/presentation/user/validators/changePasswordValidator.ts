import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export function validateChangePasswordRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = changePasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Invalid request.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
