import { RateLimitErrorCode } from '@turfhood/shared';

import { AppError } from './AppError.js';

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, RateLimitErrorCode.TOO_MANY_REQUESTS);
  }
}
