import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class GoogleTokenInvalidError extends AppError {
  constructor() {
    super('Google sign-in failed. Please try again.', 401, AuthErrorCode.GOOGLE_TOKEN_INVALID);
  }
}
