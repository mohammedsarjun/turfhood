import { AppError } from '@shared/errors/AppError';

/** Thrown when set-password is attempted on an account that already has a password. */
export class PasswordAlreadySetError extends AppError {
  constructor() {
    super('A password is already set on this account. Use "change password" instead.', 409);
  }
}
