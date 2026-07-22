import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

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
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: 'Invalid email address.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
