import { z } from 'zod';

// Mirrors backend/src/domain/user/value-objects/Email.ts exactly.
export const changeEmailSchema = z.object({
  newEmail: z.string().trim().pipe(z.email('Enter a valid email address.')),
});

export type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;
