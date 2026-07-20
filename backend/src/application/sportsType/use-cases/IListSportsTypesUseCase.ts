import type { CatalogItem, PaginatedResponse } from '@turfhood/shared';

import type { ListSportsTypesRequestDTO } from '../dtos/ListSportsTypesRequestDTO.js';

export interface IListSportsTypesUseCase {
  execute(request: ListSportsTypesRequestDTO): Promise<PaginatedResponse<CatalogItem>>;
}
