import { AppError } from '@shared/errors/AppError';
import { AdminErrorCode } from '@turfhood/shared';

/** Thrown when a structurally valid token's roles don't include 'admin'. */
export class AdminAccessRequiredError extends AppError {
  constructor() {
    super('Admin access is required for this action.', 403, AdminErrorCode.ADMIN_ACCESS_REQUIRED);
  }
}
