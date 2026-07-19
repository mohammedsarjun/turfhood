import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const requestEmailChangeSchema = z.object({
  newEmail: z.string().trim().email('Enter a valid email address.'),
});

export function validateRequestEmailChangeRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = requestEmailChangeSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Invalid email address.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
