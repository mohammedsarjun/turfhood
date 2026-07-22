import { z } from 'zod';

// name/email/phone/password mirror backend/src/domain/user/value-objects/{Password,Email,Phone}.ts exactly.
// agreeToTerms is a client-only gate and is never sent to the API.
export const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.'),
  email: z.string().trim().pipe(z.email('Enter a valid email address.')),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
  agreeToTerms: z
    .boolean()
    .refine(
      (value) => value === true,
      'You must agree to the Terms of Service and Privacy Policy.',
    ),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
