import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class InvalidEmailError extends AppError {
  constructor(rawEmail: string) {
    super(`"${rawEmail}" is not a valid email address.`, HttpStatus.BAD_REQUEST);
  }
}
