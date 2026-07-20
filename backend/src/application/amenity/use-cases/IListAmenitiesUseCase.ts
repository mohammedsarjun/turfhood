import type { CatalogItem, PaginatedResponse } from '@turfhood/shared';

import type { ListAmenitiesRequestDTO } from '../dtos/ListAmenitiesRequestDTO.js';

export interface IListAmenitiesUseCase {
  execute(request: ListAmenitiesRequestDTO): Promise<PaginatedResponse<CatalogItem>>;
}
