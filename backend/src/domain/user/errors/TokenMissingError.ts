import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class TokenMissingError extends AppError {
  constructor() {
    super('Authentication token is missing.', HttpStatus.UNAUTHORIZED, AuthErrorCode.TOKEN_MISSING);
  }
}
