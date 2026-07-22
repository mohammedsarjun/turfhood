import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { CatalogErrorCode } from '@turfhood/shared';

export class DuplicateSportsTypeNameError extends AppError {
  constructor(name: string) {
    super(`A sport named "${name}" already exists.`, HttpStatus.CONFLICT, CatalogErrorCode.DUPLICATE_NAME);
  }
}
