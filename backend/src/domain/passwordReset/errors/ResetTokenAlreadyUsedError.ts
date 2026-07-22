import { PasswordResetErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class ResetTokenAlreadyUsedError extends AppError {
  constructor() {
    super(
      'This password reset link has already been used.',
      HttpStatus.BAD_REQUEST,
      PasswordResetErrorCode.RESET_TOKEN_ALREADY_USED,
    );
  }
}
