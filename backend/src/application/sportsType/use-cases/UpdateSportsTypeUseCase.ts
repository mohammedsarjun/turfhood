import { inject, injectable } from 'tsyringe';
import { SportsTypeNotFoundError } from '@domain/sportsType/errors/SportsTypeNotFoundError';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import type { CatalogItem } from '@turfhood/shared';

import type { UpdateSportsTypeRequestDTO } from '../dtos/UpdateSportsTypeRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { IUpdateSportsTypeUseCase } from './IUpdateSportsTypeUseCase.js';

@injectable()
export class UpdateSportsTypeUseCase implements IUpdateSportsTypeUseCase {
  constructor(
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository)
    private readonly sportsTypeRepository: ISportsTypeRepository,
  ) {}

  async execute(request: UpdateSportsTypeRequestDTO): Promise<CatalogItem> {
    const name = request.name?.trim();
    const icon = request.icon?.trim();

    const updated = await this.sportsTypeRepository.update(request.id, {
      ...(name ? { name } : {}),
      ...(icon ? { icon } : {}),
    });
    if (!updated) {
      throw new SportsTypeNotFoundError();
    }

    return toCatalogItemDTO(updated);
  }
}
