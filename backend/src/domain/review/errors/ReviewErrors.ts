import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class ReviewActionError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, 'REVIEW_ACTION_NOT_ALLOWED');
  }
}

export class ReviewNotFoundError extends AppError {
  constructor() {
    super('Review not found.', HttpStatus.NOT_FOUND, 'REVIEW_NOT_FOUND');
  }
}
