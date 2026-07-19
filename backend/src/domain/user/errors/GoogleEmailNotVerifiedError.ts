import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class GoogleEmailNotVerifiedError extends AppError {
  constructor() {
    super(
      'Your Google email is not verified. Please verify it with Google and try again.',
      400,
      AuthErrorCode.GOOGLE_EMAIL_NOT_VERIFIED,
    );
  }
}
