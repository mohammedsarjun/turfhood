import { AppError } from '@shared/errors/AppError';
import { CatalogErrorCode } from '@turfhood/shared';

export class AmenityNotFoundError extends AppError {
  constructor() {
    super('Amenity not found.', 404, CatalogErrorCode.ITEM_NOT_FOUND);
  }
}
