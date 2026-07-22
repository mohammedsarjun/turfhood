import { z } from 'zod';

// Mirrors backend/src/domain/user/entities/User.ts's name handling (trim + non-empty).
export const updateNameSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.'),
});

export type UpdateNameFormValues = z.infer<typeof updateNameSchema>;
