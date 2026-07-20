import type { CatalogItem } from '@turfhood/shared';

import type { UploadAmenityIconRequestDTO } from '../dtos/UploadAmenityIconRequestDTO.js';

export interface IUploadAmenityIconUseCase {
  execute(request: UploadAmenityIconRequestDTO): Promise<CatalogItem>;
}
