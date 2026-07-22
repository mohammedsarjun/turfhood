import type { CatalogItem } from '@turfhood/shared';

import type { UploadSportsTypeIconRequestDTO } from '../dtos/UploadSportsTypeIconRequestDTO.js';

export interface IUploadSportsTypeIconUseCase {
  execute(request: UploadSportsTypeIconRequestDTO): Promise<CatalogItem>;
}
