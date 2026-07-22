import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpStatus } from '@shared/constants/httpStatus';

const nameDescriptionSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(100),
  description: z.string().trim().max(1000).optional(),
});

const addressSchema = z.object({
  line1: z.string().trim().min(1, 'Address line is required.'),
  city: z.string().trim().min(1, 'City is required.'),
  cityCode: z.string().trim().min(1, 'City is required.'),
  state: z.string().trim().min(1, 'State is required.'),
  stateCode: z.string().trim().min(1, 'State is required.'),
  country: z.string().trim().min(1, 'Country is required.'),
  countryCode: z.string().trim().min(1, 'Country is required.'),
  pincode: z.string().trim().min(1, 'Pincode is required.'),
});

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export interface ParsedSubmitTurfOwnerApplication {
  name: string;
  description?: string;
  address: z.infer<typeof addressSchema>;
  coordinates: z.infer<typeof coordinatesSchema>;
  sportsOffered: string[];
  amenities: string[];
  documentTypes: string[];
  imageCoverFlags: boolean[];
}

export interface SubmitTurfOwnerApplicationRequest extends Request {
  validatedSubmission?: ParsedSubmitTurfOwnerApplication;
}

/**
 * Multipart text fields arrive as strings — `address`/`coordinates`/`sportsOffered`/`amenities`/
 * `documentTypes` are JSON-stringified by the client and parsed+validated here.
 */
export function validateSubmitTurfOwnerApplicationRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const bodyResult = nameDescriptionSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({
        message: 'Invalid application details.',
        errors: bodyResult.error.flatten().fieldErrors,
      });
    return;
  }

  try {
    const address = addressSchema.parse(JSON.parse(req.body.address));
    const coordinates = coordinatesSchema.parse(JSON.parse(req.body.coordinates));
    const sportsOffered = z
      .array(z.string().min(1))
      .min(1, 'Select at least one sport offered.')
      .parse(JSON.parse(req.body.sportsOffered));
    const amenities = req.body.amenities
      ? z.array(z.string()).parse(JSON.parse(req.body.amenities))
      : [];
    const documentTypes = z
      .array(z.string().min(1))
      .parse(JSON.parse(req.body.documentTypes ?? '[]'));
    const imageCoverFlags = z
      .array(z.boolean())
      .parse(JSON.parse(req.body.imageCoverFlags ?? '[]'));

    (req as SubmitTurfOwnerApplicationRequest).validatedSubmission = {
      name: bodyResult.data.name,
      ...(bodyResult.data.description ? { description: bodyResult.data.description } : {}),
      address,
      coordinates,
      sportsOffered,
      amenities,
      documentTypes,
      imageCoverFlags,
    };
    next();
  } catch {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid application details.' });
  }
}
