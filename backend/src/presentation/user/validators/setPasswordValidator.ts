import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

export const setPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export function validateSetPasswordRequest(req: Request, res: Response, next: NextFunction): void {
  const result = setPasswordSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: 'Invalid request.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
