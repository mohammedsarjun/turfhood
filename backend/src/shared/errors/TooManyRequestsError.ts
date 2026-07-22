import { RateLimitErrorCode } from '@turfhood/shared';

import { HttpStatus } from '../constants/httpStatus.js';

import { AppError } from './AppError.js';

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, HttpStatus.TOO_MANY_REQUESTS, RateLimitErrorCode.TOO_MANY_REQUESTS);
  }
}
