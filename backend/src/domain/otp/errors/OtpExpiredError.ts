import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class OtpExpiredError extends AppError {
  constructor() {
    super('Verification code has expired.', HttpStatus.BAD_REQUEST, OtpErrorCode.OTP_EXPIRED);
  }
}
