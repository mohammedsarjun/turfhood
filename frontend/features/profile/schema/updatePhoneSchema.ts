import { z } from 'zod';

// Mirrors backend/src/domain/user/value-objects/Phone.ts exactly.
export const updatePhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number.'),
});

export type UpdatePhoneFormValues = z.infer<typeof updatePhoneSchema>;
