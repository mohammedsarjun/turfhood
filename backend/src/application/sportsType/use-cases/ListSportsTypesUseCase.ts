import { inject, injectable } from 'tsyringe';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import type { CatalogItem, PaginatedResponse } from '@turfhood/shared';

import type { ListSportsTypesRequestDTO } from '../dtos/ListSportsTypesRequestDTO.js';
import { toCatalogItemDTO } from '../mappers/toCatalogItemDTO.js';

import type { IListSportsTypesUseCase } from './IListSportsTypesUseCase.js';

@injectable()
export class ListSportsTypesUseCase implements IListSportsTypesUseCase {
  constructor(
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository)
    private readonly sportsTypeRepository: ISportsTypeRepository,
  ) {}

  async execute(request: ListSportsTypesRequestDTO): Promise<PaginatedResponse<CatalogItem>> {
    const { items, total } = await this.sportsTypeRepository.list(request);

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
