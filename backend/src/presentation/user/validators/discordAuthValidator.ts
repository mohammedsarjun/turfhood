import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

export const discordAuthSchema = z.object({
  code: z.string().min(1, 'Missing Discord authorization code.'),
  redirectUri: z.string().optional(),
});

export function validateDiscordAuthRequest(req: Request, res: Response, next: NextFunction): void {
  const result = discordAuthSchema.safeParse(req.body);
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
