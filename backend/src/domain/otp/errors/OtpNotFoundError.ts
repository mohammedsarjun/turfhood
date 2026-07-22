import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class OtpNotFoundError extends AppError {
  constructor() {
    super(
      'No verification code found for this email. Please request a new one.',
      HttpStatus.BAD_REQUEST,
      OtpErrorCode.OTP_NOT_FOUND,
    );
  }
}
