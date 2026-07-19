import { PasswordResetErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class ResetTokenAlreadyUsedError extends AppError {
  constructor() {
    super(
      'This password reset link has already been used.',
      400,
      PasswordResetErrorCode.RESET_TOKEN_ALREADY_USED,
    );
  }
}
