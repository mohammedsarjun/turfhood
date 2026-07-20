import { z } from 'zod';

export const amenityFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(50),
});

export type AmenityFormValues = z.infer<typeof amenityFormSchema>;
