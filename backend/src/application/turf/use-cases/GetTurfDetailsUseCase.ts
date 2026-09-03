import { inject, injectable } from 'tsyringe';
import type { PublicCourtCardDTO, TurfDetailResponse } from '@turfhood/shared';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import type { ITurfImageRepository } from '@domain/turf/repositories/ITurfImageRepository';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import { COURT_TOKENS } from '@domain/court/tokens';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

import type { IGetTurfDetailsUseCase } from './IGetTurfDetailsUseCase.js';

@injectable()
export class GetTurfDetailsUseCase implements IGetTurfDetailsUseCase {
  constructor(
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(TURF_TOKENS.TurfImageRepository) private readonly images: ITurfImageRepository,
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository) private readonly sports: ISportsTypeRepository,
  ) {}

  async execute(turfId: string, page: number, limit: number): Promise<TurfDetailResponse> {
    const turf = await this.turfs.findApprovedById(turfId);
    if (!turf) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
    const [imageMap, courtResult, sportResult] = await Promise.all([
      this.images.findImageUrls([turfId]),
      this.courts.listPublic({ turfId, page, limit }),
      this.sports.list({ page: 1, limit: 100, isListed: true }),
    ]);
    const sportNames = new Map(
      sportResult.items.flatMap((sport) => (sport.id ? [[sport.id, sport.name] as const] : [])),
    );
    const courtCards: PublicCourtCardDTO[] = courtResult.items.map((court) => {
      const prices = court.pricingRules.map((rule) => rule.pricePerSlot);
      const startingPricePerSlot = prices.length ? Math.min(...prices) : undefined;
      return {
        id: court.id,
        name: court.name,
        images: court.images.map((image) => image.url),
        sports: court.sportTypeIds.flatMap((id) =>
          sportNames.get(id) ? [sportNames.get(id)!] : [],
        ),
        capacity: court.capacity,
        slotDurationMinutes: court.slotDurationMinutes,
        ...(startingPricePerSlot !== undefined ? { startingPricePerSlot } : {}),
      };
    });
    const [longitude, latitude] = turf.location.coordinates;
    return {
      turf: {
        id: turf.id!,
        name: turf.name,
        ...(turf.description ? { description: turf.description } : {}),
        images: imageMap.get(turfId) ?? [],
        sports: [
          ...new Set([
            ...turf.sportsOffered.flatMap((id) => {
              const name = sportNames.get(id);
              return name ? [name] : [];
            }),
            ...courtCards.flatMap((court) => court.sports),
          ]),
        ],
        amenities: turf.amenities.map((amenity) => amenity.name),
        rating: turf.rating.avg,
        ratingCount: turf.rating.count,
        address: [turf.address.line1, turf.address.city, turf.address.state, turf.address.pincode]
          .filter(Boolean)
          .join(', '),
        location: { latitude: latitude!, longitude: longitude! },
      },
      courts: {
        items: courtCards,
        pagination: {
          page,
          limit,
          total: courtResult.total,
          totalPages: Math.max(1, Math.ceil(courtResult.total / limit)),
        },
      },
    };
  }
}
