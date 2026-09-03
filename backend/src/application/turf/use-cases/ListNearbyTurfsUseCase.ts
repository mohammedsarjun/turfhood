import { inject, injectable } from 'tsyringe';
import type { NearbyTurfDTO, PaginatedResponse, TurfDiscoveryFilters } from '@turfhood/shared';
import type { Turf } from '@domain/turf/entities/Turf';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import type { ITurfImageRepository } from '@domain/turf/repositories/ITurfImageRepository';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { COURT_TOKENS } from '@domain/court/tokens';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import { TURF_TOKENS } from '@domain/turf/tokens';

import type {
  IListNearbyTurfsUseCase,
  NearbyTurfLocationInput,
} from './IListNearbyTurfsUseCase.js';

@injectable()
export class ListNearbyTurfsUseCase implements IListNearbyTurfsUseCase {
  constructor(
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(TURF_TOKENS.TurfImageRepository) private readonly images: ITurfImageRepository,
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository)
    private readonly sportsTypes: ISportsTypeRepository,
  ) {}

  async execute(location: NearbyTurfLocationInput, limit = 4): Promise<NearbyTurfDTO[]> {
    const turfs = await this.turfs.findApprovedByCity(
      {
        cityCode: location.cityCode.trim(),
        cityName: location.cityName.trim(),
        stateCode: location.stateCode.trim(),
        stateName: location.stateName.trim(),
      },
      Math.min(limit, 20),
    );
    return this.enrich(turfs, new Map());
  }

  async discover(filters: TurfDiscoveryFilters): Promise<PaginatedResponse<NearbyTurfDTO>> {
    const needsCourtFilter = Boolean(
      filters.sportTypeId || filters.minPrice !== undefined || filters.maxPrice !== undefined,
    );
    const eligibleTurfIds = needsCourtFilter
      ? await this.courts.findTurfIdsMatchingDiscoveryFilters({
          ...(filters.sportTypeId ? { sportTypeId: filters.sportTypeId } : {}),
          ...(filters.minPrice !== undefined ? { minPrice: filters.minPrice } : {}),
          ...(filters.maxPrice !== undefined ? { maxPrice: filters.maxPrice } : {}),
        })
      : undefined;
    const result = await this.turfs.discover({
      page: filters.page,
      limit: filters.limit,
      ...(filters.latitude !== undefined && filters.longitude !== undefined
        ? { coordinates: { latitude: filters.latitude, longitude: filters.longitude } }
        : {}),
      ...(filters.stateCode ? { stateCode: filters.stateCode } : {}),
      ...(filters.stateName ? { stateName: filters.stateName } : {}),
      ...(filters.cityCode ? { cityCode: filters.cityCode } : {}),
      ...(filters.cityName ? { cityName: filters.cityName } : {}),
      ...(filters.amenityIds?.length ? { amenityIds: filters.amenityIds } : {}),
      ...(filters.minRating !== undefined ? { minRating: filters.minRating } : {}),
      ...(eligibleTurfIds ? { eligibleTurfIds } : {}),
    });
    return {
      items: await this.enrich(result.items, result.distances),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / filters.limit)),
      },
    };
  }

  async byIds(ids: string[]): Promise<NearbyTurfDTO[]> {
    return this.enrich(await this.turfs.findApprovedByIds(ids), new Map());
  }

  private async enrich(turfs: Turf[], distances: Map<string, number>): Promise<NearbyTurfDTO[]> {
    const turfIds = turfs.flatMap((turf) => (turf.id ? [turf.id] : []));
    const [imageUrls, courtDetails, sportResult] = await Promise.all([
      this.images.findImageUrls(turfIds),
      this.courts.findDiscoveryDetails(turfIds),
      this.sportsTypes.list({ page: 1, limit: 100, isListed: true }),
    ]);
    const sportNames = new Map(
      sportResult.items.flatMap((sport) => (sport.id ? ([[sport.id, sport.name]] as const) : [])),
    );
    return turfs.map((turf) => {
      const details = courtDetails.get(turf.id!);
      const slotPrices = (details?.prices ?? []).map((price) => price.pricePerSlot);
      const startingPricePerSlot = slotPrices.length ? Math.min(...slotPrices) : undefined;
      const onboardingSports = turf.sportsOffered.flatMap((id) => {
        const name = sportNames.get(id);
        return name ? [name] : [];
      });
      return {
        id: turf.id!,
        name: turf.name,
        ...(turf.description ? { description: turf.description } : {}),
        city: turf.address.city,
        cityCode: turf.address.cityCode,
        imageUrls: imageUrls.get(turf.id!) ?? [],
        rating: turf.rating.avg,
        ratingCount: turf.rating.count,
        sports: [...new Set([...onboardingSports, ...(details?.sports ?? [])])],
        ...(startingPricePerSlot !== undefined ? { startingPricePerSlot } : {}),
        ...(distances.has(turf.id!) ? { distanceKm: distances.get(turf.id!)! } : {}),
      };
    });
  }
}
