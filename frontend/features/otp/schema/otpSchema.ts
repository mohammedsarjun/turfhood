import { z } from 'zod';

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter the 6-digit code.')
    .regex(/^\d{6}$/, 'Code must be 6 digits.'),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
