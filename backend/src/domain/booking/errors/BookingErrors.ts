import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
export class SlotUnavailableError extends AppError {
  constructor() {
    super(
      'One or more selected slots are no longer available.',
      HttpStatus.CONFLICT,
      'SLOT_UNAVAILABLE',
    );
  }
}
export class BookingNotFoundError extends AppError {
  constructor() {
    super('Booking not found.', HttpStatus.NOT_FOUND, 'BOOKING_NOT_FOUND');
  }
}
export class BookingActionError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, 'BOOKING_ACTION_NOT_ALLOWED');
  }
}
