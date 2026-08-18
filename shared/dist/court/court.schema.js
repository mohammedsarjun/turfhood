import { z } from "zod";
const timeSchema = z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.");
export const pricingRuleSchema = z
    .object({
    dayType: z.enum(["weekday", "weekend"]),
    startTime: timeSchema,
    endTime: timeSchema,
    pricePerSlot: z
        .number()
        .positive("Price must be greater than zero.")
        .max(20_000, "Price per slot cannot exceed ₹20,000."),
})
    .refine((rule) => rule.startTime < rule.endTime, {
    path: ["endTime"],
    message: "End time must be after start time.",
});
export function getOverlappingPricingBandIndexes(rules) {
    const overlapping = new Set();
    rules.forEach((rule, index) => {
        rules.forEach((candidate, candidateIndex) => {
            if (candidateIndex !== index &&
                candidate.dayType === rule.dayType &&
                rule.startTime < candidate.endTime &&
                candidate.startTime < rule.endTime) {
                overlapping.add(index);
                overlapping.add(candidateIndex);
            }
        });
    });
    return [...overlapping];
}
export const createCourtSchema = z
    .object({
    name: z
        .string()
        .trim()
        .min(2, "Court name must contain at least 2 characters.")
        .max(80),
    sportTypeIds: z
        .array(z.string().min(1))
        .min(1, "Select at least one sport."),
    capacity: z.number().int().min(1, "Capacity must be at least 1.").max(100),
    status: z.enum(["active", "inactive", "maintenance"]),
    allowOpenSessions: z.boolean(),
    minPlayersForOpenSession: z
        .number()
        .int()
        .min(1, "Minimum players must be at least 1.")
        .max(100),
    slotDurationMinutes: z
        .number()
        .int()
        .min(15, "Slot duration must be at least 15 minutes.")
        .max(240),
    imageCoverFlags: z
        .array(z.boolean())
        .min(1, "Upload at least one court image.")
        .max(5),
    pricingRules: z
        .array(pricingRuleSchema)
        .min(1, "Add at least one pricing band."),
})
    .superRefine((value, context) => {
    if (value.allowOpenSessions &&
        value.minPlayersForOpenSession > value.capacity) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["minPlayersForOpenSession"],
            message: "Minimum players cannot exceed capacity.",
        });
    }
    if (value.imageCoverFlags.length > 0 &&
        value.imageCoverFlags.filter(Boolean).length !== 1) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["imageCoverFlags"],
            message: "Select exactly one cover image.",
        });
    }
    getOverlappingPricingBandIndexes(value.pricingRules).forEach((index) => {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pricingRules", index],
            message: "This pricing band overlaps another band for the same day type.",
        });
    });
});
