import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { CatalogErrorCode } from '@turfhood/shared';

export class SportsTypeNotFoundError extends AppError {
  constructor() {
    super('Sport not found.', HttpStatus.NOT_FOUND, CatalogErrorCode.ITEM_NOT_FOUND);
  }
}
