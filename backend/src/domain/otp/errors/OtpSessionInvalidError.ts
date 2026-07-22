import { OtpErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class OtpSessionInvalidError extends AppError {
  constructor() {
    super(
      'Your verification session has expired. Please start over.',
      HttpStatus.UNAUTHORIZED,
      OtpErrorCode.OTP_SESSION_INVALID,
    );
  }
}
