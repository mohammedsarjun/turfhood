import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { CatalogErrorCode } from '@turfhood/shared';

export class DuplicateAmenityNameError extends AppError {
  constructor(name: string) {
    super(`An amenity named "${name}" already exists.`, HttpStatus.CONFLICT, CatalogErrorCode.DUPLICATE_NAME);
  }
}
