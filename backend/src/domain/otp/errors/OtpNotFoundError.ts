import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class OtpNotFoundError extends AppError {
  constructor() {
    super(
      'No verification code found for this email. Please request a new one.',
      400,
      OtpErrorCode.OTP_NOT_FOUND,
    );
  }
}
