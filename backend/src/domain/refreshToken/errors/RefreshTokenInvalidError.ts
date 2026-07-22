import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class RefreshTokenInvalidError extends AppError {
  constructor() {
    super(
      'Your session is no longer valid. Please log in again.',
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.REFRESH_TOKEN_INVALID,
    );
  }
}
