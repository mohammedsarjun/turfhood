import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class TokenInvalidError extends AppError {
  constructor() {
    super('Invalid authentication token.', HttpStatus.UNAUTHORIZED, AuthErrorCode.TOKEN_INVALID);
  }
}
