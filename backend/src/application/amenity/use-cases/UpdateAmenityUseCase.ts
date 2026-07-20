import { inject, injectable } from 'tsyringe';
import { AmenityNotFoundError } from '@domain/amenity/errors/AmenityNotFoundError';
import type { IAmenityRepository } from '@domain/amenity/repositories/IAmenityRepository';
import { AMENITY_TOKENS } from '@domain/amenity/tokens';
import type { CatalogItem } from '@turfhood/shared';

import type { UpdateAmenityRequestDTO } from '../dtos/UpdateAmenityRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { IUpdateAmenityUseCase } from './IUpdateAmenityUseCase.js';

@injectable()
export class UpdateAmenityUseCase implements IUpdateAmenityUseCase {
  constructor(
    @inject(AMENITY_TOKENS.AmenityRepository)
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(request: UpdateAmenityRequestDTO): Promise<CatalogItem> {
    const name = request.name?.trim();
    const icon = request.icon?.trim();

    const updated = await this.amenityRepository.update(request.id, {
      ...(name ? { name } : {}),
      ...(icon ? { icon } : {}),
    });
    if (!updated) {
      throw new AmenityNotFoundError();
    }

    return toCatalogItemDTO(updated);
  }
}
