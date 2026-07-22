import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class GoogleTokenInvalidError extends AppError {
  constructor() {
    super(
      'Google sign-in failed. Please try again.',
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.GOOGLE_TOKEN_INVALID,
    );
  }
}
