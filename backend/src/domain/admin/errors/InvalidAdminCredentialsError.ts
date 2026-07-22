import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { AdminErrorCode } from '@turfhood/shared';

/** Deliberately generic — doesn't reveal whether the email, password, or admin-role check failed. */
export class InvalidAdminCredentialsError extends AppError {
  constructor() {
    super('Invalid admin email or password.', HttpStatus.UNAUTHORIZED, AdminErrorCode.INVALID_ADMIN_CREDENTIALS);
  }
}
