import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class AccountSuspendedError extends AppError {
  constructor(reason?: string) {
    super(
      reason
        ? `Your account has been suspended. Reason: ${reason}`
        : 'Your account has been suspended.',
      HttpStatus.FORBIDDEN,
      'ACCOUNT_SUSPENDED',
    );
  }
}
