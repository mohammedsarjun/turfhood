import { PasswordResetErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class ResetTokenExpiredError extends AppError {
  constructor() {
    super(
      'This password reset link has expired.',
      HttpStatus.BAD_REQUEST,
      PasswordResetErrorCode.RESET_TOKEN_EXPIRED,
    );
  }
}
