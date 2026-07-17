import { AppError } from '@shared/errors/AppError';

export class DuplicatePhoneError extends AppError {
  constructor(phone: string) {
    super(`An account with phone number "${phone}" already exists.`, 409);
  }
}
