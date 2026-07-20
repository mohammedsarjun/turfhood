import type { CatalogItem } from '@turfhood/shared';

import type { UpdateAmenityRequestDTO } from '../dtos/UpdateAmenityRequestDTO.js';

export interface IUpdateAmenityUseCase {
  execute(request: UpdateAmenityRequestDTO): Promise<CatalogItem>;
}
