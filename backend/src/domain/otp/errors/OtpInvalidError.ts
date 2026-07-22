import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class OtpInvalidError extends AppError {
  constructor() {
    super('Invalid verification code.', HttpStatus.BAD_REQUEST, OtpErrorCode.OTP_INVALID);
  }
}
