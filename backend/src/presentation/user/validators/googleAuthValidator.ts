import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const googleAuthSchema = z.object({
  code: z.string().min(1, 'Missing Google authorization code.'),
});

export function validateGoogleAuthRequest(req: Request, res: Response, next: NextFunction): void {
  const result = googleAuthSchema.safeParse(req.body);
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
