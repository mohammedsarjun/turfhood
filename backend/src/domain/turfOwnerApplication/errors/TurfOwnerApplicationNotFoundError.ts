import { AppError } from '@shared/errors/AppError';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class TurfOwnerApplicationNotFoundError extends AppError {
  constructor() {
    super('Turf-owner application not found.', 404, TurfOnboardingErrorCode.APPLICATION_NOT_FOUND);
  }
}
