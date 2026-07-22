import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class TurfOwnerApplicationNotFoundError extends AppError {
  constructor() {
    super(
      'Turf-owner application not found.',
      HttpStatus.NOT_FOUND,
      TurfOnboardingErrorCode.APPLICATION_NOT_FOUND,
    );
  }
}
