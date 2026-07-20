import type { CatalogItem } from '@turfhood/shared';

import type { UpdateSportsTypeRequestDTO } from '../dtos/UpdateSportsTypeRequestDTO.js';

export interface IUpdateSportsTypeUseCase {
  execute(request: UpdateSportsTypeRequestDTO): Promise<CatalogItem>;
}
