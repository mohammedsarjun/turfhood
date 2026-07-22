import { AppError } from '@shared/errors/AppError';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class InvalidLocationError extends AppError {
  constructor() {
    super(
      'Please select a valid country, state, and city combination.',
      400,
      TurfOnboardingErrorCode.INVALID_LOCATION,
    );
  }
}
