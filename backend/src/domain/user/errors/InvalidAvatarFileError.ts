import { AppError } from '@shared/errors/AppError';

export class InvalidAvatarFileError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
