import { AppError } from '@shared/errors/AppError';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class InvalidCoordinatesError extends AppError {
  constructor(message = 'Please pinpoint your turf\'s location on the map.') {
    super(message, 400, TurfOnboardingErrorCode.INVALID_COORDINATES);
  }
}
