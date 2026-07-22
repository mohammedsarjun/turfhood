import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().trim().pipe(z.email('Enter a valid email address.')),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
