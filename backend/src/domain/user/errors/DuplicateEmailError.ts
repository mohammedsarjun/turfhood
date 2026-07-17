import { AppError } from '@shared/errors/AppError';

export class DuplicateEmailError extends AppError {
  constructor(email: string) {
    super(`An account with email "${email}" already exists.`, 409);
  }
}
