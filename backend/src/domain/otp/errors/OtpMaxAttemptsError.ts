import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class OtpMaxAttemptsError extends AppError {
  constructor() {
    super(
      'Too many incorrect attempts. Please request a new code.',
      HttpStatus.TOO_MANY_REQUESTS,
      OtpErrorCode.OTP_MAX_ATTEMPTS,
    );
  }
}
