import { AppError } from '@shared/errors/AppError';

export class WeakPasswordError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
