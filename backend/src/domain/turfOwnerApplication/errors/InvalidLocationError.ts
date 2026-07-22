import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class InvalidLocationError extends AppError {
  constructor() {
    super(
      'Please select a valid country, state, and city combination.',
      HttpStatus.BAD_REQUEST,
      TurfOnboardingErrorCode.INVALID_LOCATION,
    );
  }
}
