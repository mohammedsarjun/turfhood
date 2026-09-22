import { AuthErrorCode } from '@turfhood/shared';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class DiscordEmailNotVerifiedError extends AppError {
  constructor() {
    super(
      'Your Discord account email is not verified. Please verify your email on Discord and try again.',
      HttpStatus.UNAUTHORIZED,
      AuthErrorCode.DISCORD_EMAIL_NOT_VERIFIED,
    );
  }
}
