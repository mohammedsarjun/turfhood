import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { AdminErrorCode } from '@turfhood/shared';

/** Thrown when a structurally valid token's roles don't include 'admin'. */
export class AdminAccessRequiredError extends AppError {
  constructor() {
    super('Admin access is required for this action.', HttpStatus.FORBIDDEN, AdminErrorCode.ADMIN_ACCESS_REQUIRED);
  }
}
