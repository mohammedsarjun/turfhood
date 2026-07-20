import { AppError } from '@shared/errors/AppError';
import { CatalogErrorCode } from '@turfhood/shared';

export class SportsTypeNotFoundError extends AppError {
  constructor() {
    super('Sport not found.', 404, CatalogErrorCode.ITEM_NOT_FOUND);
  }
}
