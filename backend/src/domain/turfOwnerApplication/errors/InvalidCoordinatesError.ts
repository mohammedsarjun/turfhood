import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class InvalidCoordinatesError extends AppError {
  constructor(message = 'Please pinpoint your turf\'s location on the map.') {
    super(message, HttpStatus.BAD_REQUEST, TurfOnboardingErrorCode.INVALID_COORDINATES);
  }
}
