import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class DiscordTokenInvalidError extends AppError {
  constructor() {
    super(
      'Discord sign-in failed. Please try again.',
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.DISCORD_TOKEN_INVALID,
    );
  }
}
