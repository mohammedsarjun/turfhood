import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class OtpSessionInvalidError extends AppError {
  constructor() {
    super(
      'Your verification session has expired. Please start over.',
      401,
      OtpErrorCode.OTP_SESSION_INVALID,
    );
  }
}
