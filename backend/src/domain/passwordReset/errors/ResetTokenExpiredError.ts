import { PasswordResetErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class ResetTokenExpiredError extends AppError {
  constructor() {
    super('This password reset link has expired.', 400, PasswordResetErrorCode.RESET_TOKEN_EXPIRED);
  }
}
