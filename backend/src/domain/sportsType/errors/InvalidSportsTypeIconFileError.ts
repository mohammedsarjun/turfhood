import { AppError } from '@shared/errors/AppError';

export class InvalidSportsTypeIconFileError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
