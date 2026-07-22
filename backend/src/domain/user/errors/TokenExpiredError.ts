import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class TokenExpiredError extends AppError {
  constructor() {
    super(
      'Authentication token has expired.',
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.TOKEN_EXPIRED,
    );
  }
}
