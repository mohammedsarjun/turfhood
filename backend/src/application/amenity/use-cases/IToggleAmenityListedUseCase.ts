import type { CatalogItem } from '@turfhood/shared';

import type { ToggleAmenityListedRequestDTO } from '../dtos/ToggleAmenityListedRequestDTO.js';

export interface IToggleAmenityListedUseCase {
  execute(request: ToggleAmenityListedRequestDTO): Promise<CatalogItem>;
}
