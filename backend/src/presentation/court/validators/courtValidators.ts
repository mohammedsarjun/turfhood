import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { createCourtSchema, type CreateCourtFields } from '@turfhood/shared';
import { HttpStatus } from '@shared/constants/httpStatus';

export type ValidatedCourtRequest = Request & {
  validatedCourt?: CreateCourtFields;
};

export function validateCreateCourt(req: Request, res: Response, next: NextFunction): void {
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(String(req.body.data ?? ''));
  } catch {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid court details.' });
    return;
  }
  const result = createCourtSchema.safeParse(parsedBody);
  const files = (req as Request & { files?: Express.Multer.File[] }).files ?? [];
  if (
    !result.success ||
    files.length === 0 ||
    files.length !== result.data?.imageCoverFlags.length
  ) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Invalid court details.',
      errors: !result.success
        ? result.error.flatten().fieldErrors
        : { imageCoverFlags: ['Upload at least one court image.'] },
    });
    return;
  }
  (req as ValidatedCourtRequest).validatedCourt = result.data;
  next();
}

const listSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(80).optional(),
});

export type ValidatedCourtListRequest = Request & { validatedQuery?: z.infer<typeof listSchema> };

export function validateListCourts(req: Request, res: Response, next: NextFunction): void {
  const result = listSchema.safeParse(req.query);
  if (!result.success) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid court filters.' });
    return;
  }
  (req as ValidatedCourtListRequest).validatedQuery = result.data;
  next();
}
