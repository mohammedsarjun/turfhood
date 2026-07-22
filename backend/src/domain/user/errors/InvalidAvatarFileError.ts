import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class InvalidAvatarFileError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
