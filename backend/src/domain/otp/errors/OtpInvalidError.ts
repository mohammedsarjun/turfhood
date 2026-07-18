import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class OtpInvalidError extends AppError {
  constructor() {
    super('Invalid verification code.', 400, OtpErrorCode.OTP_INVALID);
  }
}
