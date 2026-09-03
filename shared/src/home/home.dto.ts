export interface BannerDTO {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface NearbyTurfDTO {
  id: string;
  name: string;
  description?: string;
  city: string;
  cityCode: string;
  imageUrls: string[];
  rating: number;
  ratingCount: number;
  sports: string[];
  startingPricePerSlot?: number;
  distanceKm?: number;
}

export interface TurfDiscoveryFilters {
  page: number;
  limit: number;
  latitude?: number;
  longitude?: number;
  stateCode?: string;
  stateName?: string;
  cityCode?: string;
  cityName?: string;
  sportTypeId?: string;
  amenityIds?: string[];
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface PublicCourtCardDTO {
  id: string;
  name: string;
  images: string[];
  sports: string[];
  capacity: number;
  slotDurationMinutes: number;
  startingPricePerSlot?: number;
}

export interface TurfDetailDTO {
  id: string;
  name: string;
  description?: string;
  images: string[];
  sports: string[];
  amenities: string[];
  rating: number;
  ratingCount: number;
  address: string;
  location: { latitude: number; longitude: number };
}

export interface TurfDetailResponse {
  turf: TurfDetailDTO;
  courts: import("../common/pagination.js").PaginatedResponse<PublicCourtCardDTO>;
}

export type SlotPeriod = "morning" | "afternoon" | "evening" | "night";

export interface PublicCourtSlotDTO {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  period: SlotPeriod;
  available: boolean;
  unavailableReason?: "booked" | "reserved" | "blocked" | "past" | "closed";
}

export interface PublicCourtSlotDateDTO {
  date: string;
  isClosed: boolean;
  slots: PublicCourtSlotDTO[];
}

export interface PublicCourtDetailsResponse {
  turf: { id: string; name: string };
  court: PublicCourtCardDTO & { allowOpenSessions: boolean };
  dates: PublicCourtSlotDateDTO[];
}
