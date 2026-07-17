import { AppError } from '@shared/errors/AppError';

export class InvalidPhoneError extends AppError {
  constructor(rawPhone: string) {
    super(`"${rawPhone}" is not a valid phone number.`, 400);
  }
}
