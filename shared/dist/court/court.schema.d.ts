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
    slotDurationMinutes: z.ZodEffects<z.ZodNumber, number, number>;
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
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}, {
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}>, {
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}, {
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}>;
export declare const createAvailabilityOverrideSchema: z.ZodEffects<z.ZodObject<{
    date: z.ZodString;
    isClosed: z.ZodBoolean;
    closureReason: z.ZodOptional<z.ZodEnum<["holiday", "maintenance", "private_event", "weather", "other"]>>;
    blockedSlots: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
        startTime: z.ZodString;
        endTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startTime: string;
        endTime: string;
    }, {
        startTime: string;
        endTime: string;
    }>, {
        startTime: string;
        endTime: string;
    }, {
        startTime: string;
        endTime: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    date: string;
    isClosed: boolean;
    blockedSlots: {
        startTime: string;
        endTime: string;
    }[];
    closureReason?: "maintenance" | "holiday" | "private_event" | "weather" | "other" | undefined;
}, {
    date: string;
    isClosed: boolean;
    closureReason?: "maintenance" | "holiday" | "private_event" | "weather" | "other" | undefined;
    blockedSlots?: {
        startTime: string;
        endTime: string;
    }[] | undefined;
}>, {
    date: string;
    isClosed: boolean;
    blockedSlots: {
        startTime: string;
        endTime: string;
    }[];
    closureReason?: "maintenance" | "holiday" | "private_event" | "weather" | "other" | undefined;
}, {
    date: string;
    isClosed: boolean;
    closureReason?: "maintenance" | "holiday" | "private_event" | "weather" | "other" | undefined;
    blockedSlots?: {
        startTime: string;
        endTime: string;
    }[] | undefined;
}>;
export declare const updateCourtSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    sportTypeIds: z.ZodArray<z.ZodString, "many">;
    capacity: z.ZodNumber;
    status: z.ZodEnum<["active", "inactive", "maintenance"]>;
    allowOpenSessions: z.ZodBoolean;
    minPlayersForOpenSession: z.ZodNumber;
    slotDurationMinutes: z.ZodEffects<z.ZodNumber, number, number>;
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
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}, {
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}>, {
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}, {
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}>, {
    imageCoverFlags: boolean[];
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}, unknown>, {
    name: string;
    sportTypeIds: string[];
    capacity: number;
    status: "active" | "inactive" | "maintenance";
    allowOpenSessions: boolean;
    minPlayersForOpenSession: number;
    slotDurationMinutes: number;
    pricingRules: {
        dayType: "weekday" | "weekend";
        startTime: string;
        endTime: string;
        pricePerSlot: number;
    }[];
}, unknown>;
export {};
