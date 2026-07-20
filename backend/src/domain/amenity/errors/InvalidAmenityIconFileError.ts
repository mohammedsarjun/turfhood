import { AppError } from '@shared/errors/AppError';

export class InvalidAmenityIconFileError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
