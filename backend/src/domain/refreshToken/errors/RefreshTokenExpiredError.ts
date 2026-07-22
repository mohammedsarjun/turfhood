import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class RefreshTokenExpiredError extends AppError {
  constructor() {
    super(
      'Your session has expired. Please log in again.',
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.REFRESH_TOKEN_EXPIRED,
    );
  }
}
