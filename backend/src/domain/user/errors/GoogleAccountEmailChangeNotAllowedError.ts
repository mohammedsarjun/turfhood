import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

/** Google-linked accounts must change their email through Google, not through Turfhood directly. */
export class GoogleAccountEmailChangeNotAllowedError extends AppError {
  constructor() {
    super("Your email is managed by Google and can't be changed here.", HttpStatus.CONFLICT);
  }
}
