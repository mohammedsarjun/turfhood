import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  createAvailabilityOverrideSchema,
  createCourtSchema,
  updateCourtSchema,
  type CreateAvailabilityOverrideRequest,
  type CreateCourtFields,
  type UpdateCourtFields,
} from '@turfhood/shared';
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

export type ValidatedAvailabilityOverrideRequest = Request & {
  validatedOverride?: CreateAvailabilityOverrideRequest;
};

export function validateAvailabilityOverride(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = createAvailabilityOverrideSchema.safeParse(req.body);
  if (!result.success) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Invalid availability override.',
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }
  (req as ValidatedAvailabilityOverrideRequest).validatedOverride = {
    date: result.data.date,
    isClosed: result.data.isClosed,
    ...(result.data.closureReason ? { closureReason: result.data.closureReason } : {}),
    blockedSlots: result.data.blockedSlots,
  };
  next();
}

export type ValidatedCourtUpdateRequest = Request & { validatedCourtUpdate?: UpdateCourtFields };

export function validateUpdateCourt(req: Request, res: Response, next: NextFunction): void {
  const result = updateCourtSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: 'Invalid court details.', errors: result.error.flatten().fieldErrors });
    return;
  }
  (req as ValidatedCourtUpdateRequest).validatedCourtUpdate = result.data;
  next();
}
