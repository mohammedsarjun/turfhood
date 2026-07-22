import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { CatalogErrorCode } from '@turfhood/shared';

export class AmenityNotFoundError extends AppError {
  constructor() {
    super('Amenity not found.', HttpStatus.NOT_FOUND, CatalogErrorCode.ITEM_NOT_FOUND);
  }
}
