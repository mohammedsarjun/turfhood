import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';

export class TokenInvalidError extends AppError {
  constructor() {
    super('Invalid authentication token.', 401, AuthErrorCode.TOKEN_INVALID);
  }
}
