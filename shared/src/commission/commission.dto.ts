import { z } from "zod";

export const updateCommissionSchema = z.object({
  percentage: z
    .number()
    .min(1, "Commission must be at least 1%.")
    .max(50, "Commission cannot exceed 50%.")
    .refine((value) => Number.isInteger(value * 100), "Use no more than two decimal places."),
});

export type UpdateCommissionRequest = z.infer<typeof updateCommissionSchema>;

export interface CommissionSettingDTO {
  percentage: number;
  updatedAt?: string;
}
