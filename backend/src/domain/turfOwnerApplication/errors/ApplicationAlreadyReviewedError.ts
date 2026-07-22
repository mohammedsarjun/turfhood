import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class ApplicationAlreadyReviewedError extends AppError {
  constructor() {
    super(
      'This application has already been reviewed.',
      HttpStatus.CONFLICT,
      TurfOnboardingErrorCode.ALREADY_REVIEWED,
    );
  }
}
