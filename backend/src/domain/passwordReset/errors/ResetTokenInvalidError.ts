import { PasswordResetErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class ResetTokenInvalidError extends AppError {
  constructor() {
    super('Invalid or unrecognized password reset link.', 400, PasswordResetErrorCode.RESET_TOKEN_INVALID);
  }
}
