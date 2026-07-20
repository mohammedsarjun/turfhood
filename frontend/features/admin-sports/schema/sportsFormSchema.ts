import { z } from 'zod';

export const sportsFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(50),
});

export type SportsFormValues = z.infer<typeof sportsFormSchema>;
