import { AppError } from '@shared/errors/AppError';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class ApplicationAlreadyReviewedError extends AppError {
  constructor() {
    super(
      'This application has already been reviewed.',
      409,
      TurfOnboardingErrorCode.ALREADY_REVIEWED,
    );
  }
}
