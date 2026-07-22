import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class InvalidPhoneError extends AppError {
  constructor(rawPhone: string) {
    super(`"${rawPhone}" is not a valid phone number.`, HttpStatus.BAD_REQUEST);
  }
}
