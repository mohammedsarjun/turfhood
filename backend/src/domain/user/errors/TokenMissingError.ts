import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class TokenMissingError extends AppError {
  constructor() {
    super('Authentication token is missing.', 401, AuthErrorCode.TOKEN_MISSING);
  }
}
