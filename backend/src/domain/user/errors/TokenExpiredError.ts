import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class TokenExpiredError extends AppError {
  constructor() {
    super('Authentication token has expired.', 401, AuthErrorCode.TOKEN_EXPIRED);
  }
}
