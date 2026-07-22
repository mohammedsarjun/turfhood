import { AppError } from '@shared/errors/AppError';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class DuplicatePendingApplicationError extends AppError {
  constructor() {
    super(
      'You already have a pending turf-owner application. Please wait for it to be reviewed.',
      409,
      TurfOnboardingErrorCode.DUPLICATE_PENDING_APPLICATION,
    );
  }
}
