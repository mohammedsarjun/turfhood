import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

const ownerTurfSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(100, 'Name must be 100 characters or fewer.'),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or fewer.').optional(),
  address: z.object({
    line1: z.string().trim().min(1, 'Address line is required.'), city: z.string().trim().min(1, 'City is required.'), cityCode: z.string().trim().min(1, 'City is required.'),
    state: z.string().trim().min(1, 'State is required.'), stateCode: z.string().trim().min(1, 'State is required.'), country: z.string().trim().min(1, 'Country is required.'),
    countryCode: z.string().trim().min(1, 'Country is required.'), pincode: z.string().trim().min(1, 'Pincode is required.'),
  }),
  location: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }),
});
export type ValidatedOwnerTurf = z.infer<typeof ownerTurfSchema>;
export interface ValidatedOwnerTurfRequest extends Request { validatedOwnerTurf?: ValidatedOwnerTurf }
export function validateOwnerTurfUpdate(req: Request, res: Response, next: NextFunction): void {
  const result = ownerTurfSchema.safeParse(req.body);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) errors[issue.path.at(-1)?.toString() ?? 'form'] = [issue.message];
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Please correct the highlighted fields.', errors }); return;
  }
  (req as ValidatedOwnerTurfRequest).validatedOwnerTurf = result.data; next();
}
