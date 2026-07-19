import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

/** Shape check only — domain invariants are re-checked in the use case. */
export function validateAdminLoginRequest(req: Request, res: Response, next: NextFunction): void {
  const result = adminLoginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: 'Invalid admin login details.',
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }
  req.body = result.data;
  next();
}
