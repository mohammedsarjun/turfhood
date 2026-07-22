import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class UserNotFoundError extends AppError {
  constructor() {
    super('No account found for this email.', HttpStatus.NOT_FOUND);
  }
}
