import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class OtpExpiredError extends AppError {
  constructor() {
    super('Verification code has expired.', 400, OtpErrorCode.OTP_EXPIRED);
  }
}
