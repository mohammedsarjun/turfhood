import type { NearbyTurfDTO, PaginatedResponse, TurfDiscoveryFilters } from '@turfhood/shared';

export interface NearbyTurfLocationInput {
  cityCode: string;
  cityName: string;
  stateCode: string;
  stateName: string;
}

export interface IListNearbyTurfsUseCase {
  execute(location: NearbyTurfLocationInput, limit?: number): Promise<NearbyTurfDTO[]>;
  discover(filters: TurfDiscoveryFilters): Promise<PaginatedResponse<NearbyTurfDTO>>;
  byIds(ids: string[]): Promise<NearbyTurfDTO[]>;
}
