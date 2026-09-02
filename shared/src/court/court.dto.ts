import type { PaginatedResponse } from "../common/pagination.js";

export type CourtStatus = "active" | "inactive" | "maintenance";
export type PricingDayType = "weekday" | "weekend";
export type AvailabilityOverrideReasonType =
  | "holiday"
  | "maintenance"
  | "private_event"
  | "weather"
  | "other";

export interface CourtImageDTO {
  id: string;
  url: string;
  isCover: boolean;
  order: number;
}

export interface PricingRuleDTO {
  id: string;
  dayType: PricingDayType;
  startTime: string;
  endTime: string;
  pricePerSlot: number;
}

export interface CourtDTO {
  id: string;
  turfId: string;
  name: string;
  sportTypeIds: string[];
  capacity: number;
  status: CourtStatus;
  allowOpenSessions: boolean;
  minPlayersForOpenSession: number;
  slotDurationMinutes: number;
  images: CourtImageDTO[];
  pricingRules: PricingRuleDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourtFields {
  name: string;
  sportTypeIds: string[];
  capacity: number;
  status: CourtStatus;
  allowOpenSessions: boolean;
  minPlayersForOpenSession: number;
  slotDurationMinutes: number;
  imageCoverFlags: boolean[];
  pricingRules: Array<{
    dayType: PricingDayType;
    startTime: string;
    endTime: string;
    pricePerSlot: number;
  }>;
}

export type UpdateCourtFields = Omit<CreateCourtFields, "imageCoverFlags">;

export type ListCourtsResponse = PaginatedResponse<CourtDTO>;

export interface AvailabilityOverrideDTO {
  id: string;
  turfId: string;
  courtId: string;
  date: string;
  isClosed: boolean;
  closureReason?: AvailabilityOverrideReasonType;
  blockedSlots: BlockedSlotDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityPeriodDTO {
  startTime: string;
  endTime: string;
}

export type BlockedSlotDTO = AvailabilityPeriodDTO;

export interface CreateAvailabilityOverrideRequest {
  date: string;
  isClosed: boolean;
  closureReason?: AvailabilityOverrideReasonType;
  blockedSlots: BlockedSlotDTO[];
}

export interface CourtDetailsResponse {
  court: CourtDTO;
  availabilityOverrides: AvailabilityOverrideDTO[];
}
