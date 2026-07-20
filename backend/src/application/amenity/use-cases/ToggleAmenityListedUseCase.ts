import { inject, injectable } from 'tsyringe';
import { AmenityNotFoundError } from '@domain/amenity/errors/AmenityNotFoundError';
import type { IAmenityRepository } from '@domain/amenity/repositories/IAmenityRepository';
import { AMENITY_TOKENS } from '@domain/amenity/tokens';
import type { CatalogItem } from '@turfhood/shared';

import type { ToggleAmenityListedRequestDTO } from '../dtos/ToggleAmenityListedRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { IToggleAmenityListedUseCase } from './IToggleAmenityListedUseCase.js';

@injectable()
export class ToggleAmenityListedUseCase implements IToggleAmenityListedUseCase {
  constructor(
    @inject(AMENITY_TOKENS.AmenityRepository)
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(request: ToggleAmenityListedRequestDTO): Promise<CatalogItem> {
    const updated = await this.amenityRepository.setListed(request.id, request.isListed);
    if (!updated) {
      throw new AmenityNotFoundError();
    }

    return toCatalogItemDTO(updated);
  }
}
