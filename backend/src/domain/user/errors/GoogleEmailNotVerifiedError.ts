import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class GoogleEmailNotVerifiedError extends AppError {
  constructor() {
    super(
      'Your Google email is not verified. Please verify it with Google and try again.',
      HttpStatus.BAD_REQUEST,
      AuthErrorCode.GOOGLE_EMAIL_NOT_VERIFIED,
    );
  }
}
