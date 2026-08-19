import { z } from "zod";
import {
  ALLOWED_SLOT_DURATIONS,
  SLOT_DURATION_ERROR_MESSAGE,
  RAILWAY_TIME_PATTERN,
} from "./court.constants.js";

const timeSchema = z
  .string()
  .regex(RAILWAY_TIME_PATTERN, "Enter a valid time.");

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

type PricingRule = z.infer<typeof pricingRuleSchema>;

export function getOverlappingPricingBandIndexes(
  rules: PricingRule[],
): number[] {
  const overlapping = new Set<number>();
  rules.forEach((rule, index) => {
    rules.forEach((candidate, candidateIndex) => {
      if (
        candidateIndex !== index &&
        candidate.dayType === rule.dayType &&
        rule.startTime < candidate.endTime &&
        candidate.startTime < rule.endTime
      ) {
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
      .refine(
        (duration) => ALLOWED_SLOT_DURATIONS.some((allowed) => allowed === duration),
        SLOT_DURATION_ERROR_MESSAGE,
      ),
    imageCoverFlags: z
      .array(z.boolean())
      .min(1, "Upload at least one court image.")
      .max(5),
    pricingRules: z
      .array(pricingRuleSchema)
      .min(1, "Add at least one pricing band."),
  })
  .superRefine((value, context) => {
    if (
      value.allowOpenSessions &&
      value.minPlayersForOpenSession > value.capacity
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minPlayersForOpenSession"],
        message: "Minimum players cannot exceed capacity.",
      });
    }
    if (
      value.imageCoverFlags.length > 0 &&
      value.imageCoverFlags.filter(Boolean).length !== 1
    ) {
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
        message:
          "This pricing band overlaps another band for the same day type.",
      });
    });
  });

const availabilityPeriodSchema = z
  .object({ startTime: timeSchema, endTime: timeSchema })
  .refine((period) => period.startTime < period.endTime, {
    path: ["endTime"],
    message: "End time must be after start time.",
  });

const blockedPeriodSchema = availabilityPeriodSchema.and(
  z.object({ reason: z.string().trim().max(200, "Reason cannot exceed 200 characters.").optional() }),
);

function addOverlapIssues(
  periods: Array<{ startTime: string; endTime: string }>,
  path: "customHours" | "blockedPeriods",
  context: z.RefinementCtx,
): void {
  periods.forEach((period, index) => {
    if (periods.some((candidate, candidateIndex) =>
      candidateIndex !== index && period.startTime < candidate.endTime && candidate.startTime < period.endTime
    )) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: [path, index], message: "Time periods cannot overlap." });
    }
  });
}

export const createAvailabilityOverrideSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date."),
    isClosed: z.boolean(),
    closureReason: z.enum(["holiday", "maintenance", "private_event", "weather", "other"]).optional(),
    customHours: z.array(availabilityPeriodSchema).min(1, "Add at least one custom-hours period.").max(8).optional(),
    blockedPeriods: z.array(blockedPeriodSchema).max(12).default([]),
  })
  .superRefine((value, context) => {
    if (value.isClosed) {
      if (!value.closureReason) context.addIssue({ code: z.ZodIssueCode.custom, path: ["closureReason"], message: "Select a closure reason." });
      if (value.customHours || value.blockedPeriods.length > 0) context.addIssue({ code: z.ZodIssueCode.custom, path: ["isClosed"], message: "A closed day cannot contain availability periods." });
      return;
    }
    if (value.closureReason) context.addIssue({ code: z.ZodIssueCode.custom, path: ["closureReason"], message: "Closure reason is only allowed for a closed day." });
    if (!value.customHours && value.blockedPeriods.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["blockedPeriods"],
        message: "Add at least one blocked period when using regular opening hours.",
      });
    }
    addOverlapIssues(value.customHours ?? [], "customHours", context);
    addOverlapIssues(value.blockedPeriods, "blockedPeriods", context);
    if (value.customHours) {
      value.blockedPeriods.forEach((blocked, index) => {
        if (!value.customHours!.some((hours) => hours.startTime <= blocked.startTime && blocked.endTime <= hours.endTime)) {
          context.addIssue({ code: z.ZodIssueCode.custom, path: ["blockedPeriods", index], message: "Blocked periods must be inside custom hours." });
        }
      });
    }
  });

export const updateCourtSchema = z
  .preprocess(
    (value) =>
      typeof value === "object" && value !== null
        ? { ...value, imageCoverFlags: [true] }
        : value,
    createCourtSchema,
  )
  .transform(({ imageCoverFlags: _imageCoverFlags, ...court }) => court);
