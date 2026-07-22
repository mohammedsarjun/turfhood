import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

/** Thrown when set-password is attempted on an account that already has a password. */
export class PasswordAlreadySetError extends AppError {
  constructor() {
    super('A password is already set on this account. Use "change password" instead.', HttpStatus.CONFLICT);
  }
}
