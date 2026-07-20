import type { CatalogItem } from '@turfhood/shared';

import type { CreateSportsTypeRequestDTO } from '../dtos/CreateSportsTypeRequestDTO.js';

export interface ICreateSportsTypeUseCase {
  execute(request: CreateSportsTypeRequestDTO): Promise<CatalogItem>;
}
