import { AppError } from '@shared/errors/AppError';

/** Deliberately generic — doesn't reveal whether the email or the password was wrong. */
export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password.', 401);
  }
}
