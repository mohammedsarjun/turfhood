import { inject, injectable } from 'tsyringe';
import { AMENITY_TOKENS } from '@domain/amenity/tokens';
import type { IAmenityRepository } from '@domain/amenity/repositories/IAmenityRepository';
import type { CatalogItem, PaginatedResponse } from '@turfhood/shared';

import type { ListAmenitiesRequestDTO } from '../dtos/ListAmenitiesRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { IListAmenitiesUseCase } from './IListAmenitiesUseCase.js';

@injectable()
export class ListAmenitiesUseCase implements IListAmenitiesUseCase {
  constructor(
    @inject(AMENITY_TOKENS.AmenityRepository)
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(request: ListAmenitiesRequestDTO): Promise<PaginatedResponse<CatalogItem>> {
    const { items, total } = await this.amenityRepository.list(request);

    return {
      items: items.map(toCatalogItemDTO),
      pagination: {
        page: request.page,
        limit: request.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / request.limit)),
      },
    };
  }
}
