import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class AccountSuspendedError extends AppError {
  constructor() {
    super('Your account has been suspended.', HttpStatus.FORBIDDEN);
  }
}
