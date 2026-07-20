import { inject, injectable } from 'tsyringe';
import { SportsTypeNotFoundError } from '@domain/sportsType/errors/SportsTypeNotFoundError';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import type { CatalogItem } from '@turfhood/shared';

import type { ToggleSportsTypeListedRequestDTO } from '../dtos/ToggleSportsTypeListedRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { IToggleSportsTypeListedUseCase } from './IToggleSportsTypeListedUseCase.js';

@injectable()
export class ToggleSportsTypeListedUseCase implements IToggleSportsTypeListedUseCase {
  constructor(
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository)
    private readonly sportsTypeRepository: ISportsTypeRepository,
  ) {}

  async execute(request: ToggleSportsTypeListedRequestDTO): Promise<CatalogItem> {
    const updated = await this.sportsTypeRepository.setListed(request.id, request.isListed);
    if (!updated) {
      throw new SportsTypeNotFoundError();
    }

    return toCatalogItemDTO(updated);
  }
}
