import { AppError } from '@shared/errors/AppError';
import { CatalogErrorCode } from '@turfhood/shared';

export class DuplicateSportsTypeNameError extends AppError {
  constructor(name: string) {
    super(`A sport named "${name}" already exists.`, 409, CatalogErrorCode.DUPLICATE_NAME);
  }
}
