import { AppError } from '@shared/errors/AppError';

export class CurrentPasswordIncorrectError extends AppError {
  constructor() {
    super('Current password is incorrect.', 401);
  }
}
