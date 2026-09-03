import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class AvailabilityOverrideNotFoundError extends AppError {
  constructor() {
    super(
      'The availability override was not found.',
      HttpStatus.NOT_FOUND,
      'AVAILABILITY_OVERRIDE_NOT_FOUND',
    );
  }
}

export class DuplicateAvailabilityOverrideError extends AppError {
  constructor() {
    super(
      'An availability override already exists for this date.',
      HttpStatus.CONFLICT,
      'AVAILABILITY_OVERRIDE_EXISTS',
    );
  }
}

export class InvalidBlockedSlotError extends AppError {
  constructor() {
    super(
      'One or more selected slots are not part of this court schedule.',
      HttpStatus.BAD_REQUEST,
      'INVALID_BLOCKED_SLOT',
    );
  }
}

export class BookedSlotOverrideError extends AppError {
  constructor() {
    super(
      'Booked or temporarily reserved slots cannot be blocked or closed.',
      HttpStatus.CONFLICT,
      'BOOKED_SLOT_OVERRIDE',
    );
  }
}
