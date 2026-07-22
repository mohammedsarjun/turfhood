import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class CurrentPasswordIncorrectError extends AppError {
  constructor() {
    super('Current password is incorrect.', HttpStatus.UNAUTHORIZED);
  }
}
