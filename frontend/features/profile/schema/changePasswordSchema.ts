import { z } from 'zod';

// Mirrors backend/src/domain/user/value-objects/Password.ts exactly.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match.',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
