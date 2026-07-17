import { OtpErrorCode } from '@turfhub/shared';
import { AppError } from '@shared/errors/AppError';

export class OtpMaxAttemptsError extends AppError {
  constructor() {
    super('Too many incorrect attempts. Please request a new code.', 429, OtpErrorCode.OTP_MAX_ATTEMPTS);
  }
}
