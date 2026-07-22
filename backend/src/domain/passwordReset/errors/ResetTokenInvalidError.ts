import { PasswordResetErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class ResetTokenInvalidError extends AppError {
  constructor() {
    super(
      'Invalid or unrecognized password reset link.',
      HttpStatus.BAD_REQUEST,
      PasswordResetErrorCode.RESET_TOKEN_INVALID,
    );
  }
}
