import type { PaginatedResponse } from "../common/pagination.js";

export type CourtStatus = "active" | "inactive" | "maintenance";
export type PricingDayType = "weekday" | "weekend";

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

export type ListCourtsResponse = PaginatedResponse<CourtDTO>;
