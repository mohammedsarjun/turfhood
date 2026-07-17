import { AppError } from '@shared/errors/AppError';

export class AccountSuspendedError extends AppError {
  constructor() {
    super('Your account has been suspended.', 403);
  }
}
