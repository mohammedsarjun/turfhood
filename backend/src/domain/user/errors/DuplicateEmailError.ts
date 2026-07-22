import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class DuplicateEmailError extends AppError {
  constructor(email: string) {
    super(`An account with email "${email}" already exists.`, HttpStatus.CONFLICT);
  }
}
