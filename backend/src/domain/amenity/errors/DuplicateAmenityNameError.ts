import { AppError } from '@shared/errors/AppError';
import { CatalogErrorCode } from '@turfhood/shared';

export class DuplicateAmenityNameError extends AppError {
  constructor(name: string) {
    super(`An amenity named "${name}" already exists.`, 409, CatalogErrorCode.DUPLICATE_NAME);
  }
}
