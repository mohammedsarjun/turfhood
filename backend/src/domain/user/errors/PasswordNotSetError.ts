import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

/** Thrown when change-password is attempted on an account with no password on file (e.g. Google-only). */
export class PasswordNotSetError extends AppError {
  constructor() {
    super('This account has no password set. Use "set a password" instead.', HttpStatus.CONFLICT);
  }
}
