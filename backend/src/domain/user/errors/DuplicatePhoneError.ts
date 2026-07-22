import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class DuplicatePhoneError extends AppError {
  constructor(phone: string) {
    super(`An account with phone number "${phone}" already exists.`, HttpStatus.CONFLICT);
  }
}
