import { AppError } from '@shared/errors/AppError';

export class UserNotFoundError extends AppError {
  constructor() {
    super('No account found for this email.', 404);
  }
}
