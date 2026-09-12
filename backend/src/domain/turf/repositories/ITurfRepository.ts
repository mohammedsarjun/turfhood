import type { Turf } from '../entities/Turf.js';

export interface TurfDiscoveryRepositoryInput {
  page: number;
  limit: number;
  coordinates?: { latitude: number; longitude: number };
  stateCode?: string;
  stateName?: string;
  cityCode?: string;
  cityName?: string;
  amenityIds?: string[];
  minRating?: number;
  eligibleTurfIds?: string[];
}

export interface ITurfRepository {
  create(turf: Turf): Promise<Turf>;
  findById(id: string): Promise<Turf | null>;
  findOwnedByIdOrVerificationId(id: string, ownerId: string): Promise<Turf | null>;
  findOwnedPortalByIdOrVerificationId(id: string, ownerId: string): Promise<Turf | null>;
  findByVerificationIds(verificationIds: string[]): Promise<Turf[]>;
  updateBasicDetails(
    id: string,
    ownerId: string,
    input: {
      name: string;
      description?: string;
      address: Turf['address'];
      location: Turf['location'];
    },
  ): Promise<Turf | null>;
  findApprovedById(id: string): Promise<Turf | null>;
  findApprovedByIds(ids: string[]): Promise<Turf[]>;
  findApprovedByCity(
    location: { cityCode: string; cityName: string; stateCode: string; stateName: string },
    limit: number,
  ): Promise<Turf[]>;
  discover(input: TurfDiscoveryRepositoryInput): Promise<{
    items: Turf[];
    total: number;
    distances: Map<string, number>;
  }>;
}
