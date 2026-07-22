import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const rejectTurfOwnerApplicationSchema = z.object({
  reviewNotes: z.string().trim().max(500).optional(),
});

export function validateRejectTurfOwnerApplicationRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = rejectTurfOwnerApplicationSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(400)
      .json({ message: 'Invalid rejection details.', errors: result.error.flatten().fieldErrors });
    return;
  }
  req.body = result.data;
  next();
}
