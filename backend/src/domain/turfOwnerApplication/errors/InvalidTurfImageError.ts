import { AppError } from '@shared/errors/AppError';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class InvalidTurfImageError extends AppError {
  constructor(message: string) {
    super(message, 400, TurfOnboardingErrorCode.INVALID_IMAGE);
  }
}
