import type { CatalogItem } from '@turfhood/shared';

import type { CreateAmenityRequestDTO } from '../dtos/CreateAmenityRequestDTO.js';

export interface ICreateAmenityUseCase {
  execute(request: CreateAmenityRequestDTO): Promise<CatalogItem>;
}
