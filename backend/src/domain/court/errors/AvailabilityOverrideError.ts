import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class AvailabilityOverrideNotFoundError extends AppError {
  constructor() { super('The availability override was not found.', HttpStatus.NOT_FOUND, 'AVAILABILITY_OVERRIDE_NOT_FOUND'); }
}

export class DuplicateAvailabilityOverrideError extends AppError {
  constructor() { super('An availability override already exists for this date.', HttpStatus.CONFLICT, 'AVAILABILITY_OVERRIDE_EXISTS'); }
}
