import { z } from "zod";
export declare const pricingRuleSchema: z.ZodEffects<z.ZodObject<{
    dayType: z.ZodEnum<["weekday", "weekend"]>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    pricePerSlot: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    dayType: "weekday" | "weekend";
    startTime: string;
    endTime: string;
    pricePerSlot: number;
}, {
    dayType: "weekday" | "weekend";
    startTime: string;
    endTime: string;
    pricePerSlot: number;
}>, {
    dayType: "weekday" | "weekend";
    startTime: string;
    endTime: string;
    pricePerSlot: number;
}, {
    dayType: "weekday" | "weekend";
    startTime: string;
    endTime: string;
    pricePerSlot: number;
}>;
type PricingRule = z.infer<typeof pricingRuleSchema>;
export declare function getOverlappingPricingBandIndexes(rules: PricingRule[]): number[];
export declare const createCourtSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    sportTypeIds: z.ZodArray<z.ZodString, "many">;
    capacity: z.ZodNumber;
    status: z.ZodEnum<["active", "inactive", "maintenance"]>;
    allowOpenSessions: z.ZodBoolean;
    minPlayersForOpenSession: z.ZodNumber;
    slotDurationMinutes: z.ZodNumber;
    imageCoverFlags: z.ZodArray<z.ZodBoolean, "many">;
    pricingRules: z.ZodArray<z.ZodEffects<z.ZodObject<{
        dayType: z.ZodEnum<["weekday", "weekend"]>;
        startTime: z.ZodString;
        endTime: z.ZodString;
        pricePerSlot: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }, {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }>, {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }, {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "maintenance";
    name: string;
    sportTypeIds: string[];
    capacity: number;
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    imageCoverFlags: boolean[];
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}, {
    status: "active" | "inactive" | "maintenance";
    name: string;
    sportTypeIds: string[];
    capacity: number;
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    imageCoverFlags: boolean[];
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}>, {
    status: "active" | "inactive" | "maintenance";
    name: string;
    sportTypeIds: string[];
    capacity: number;
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    imageCoverFlags: boolean[];
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}, {
    status: "active" | "inactive" | "maintenance";
    name: string;
    sportTypeIds: string[];
    capacity: number;
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    imageCoverFlags: boolean[];
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}>;
export {};
