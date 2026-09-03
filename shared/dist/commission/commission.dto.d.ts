import { z } from "zod";
export declare const updateCommissionSchema: z.ZodObject<{
    percentage: z.ZodEffects<z.ZodNumber, number, number>;
}, "strip", z.ZodTypeAny, {
    percentage: number;
}, {
    percentage: number;
}>;
export type UpdateCommissionRequest = z.infer<typeof updateCommissionSchema>;
export interface CommissionSettingDTO {
    percentage: number;
    updatedAt?: string;
}
