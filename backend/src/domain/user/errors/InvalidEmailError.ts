import { AppError } from '@shared/errors/AppError';

export class InvalidEmailError extends AppError {
  constructor(rawEmail: string) {
    super(`"${rawEmail}" is not a valid email address.`, 400);
  }
}
