import type { CatalogItem } from '@turfhood/shared';

import type { ToggleSportsTypeListedRequestDTO } from '../dtos/ToggleSportsTypeListedRequestDTO.js';

export interface IToggleSportsTypeListedUseCase {
  execute(request: ToggleSportsTypeListedRequestDTO): Promise<CatalogItem>;
}
