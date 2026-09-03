import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class DuplicateCourtNameError extends AppError {
  constructor(name: string) {
    super(
      `A court named "${name}" already exists for this turf.`,
      HttpStatus.CONFLICT,
      'DUPLICATE_COURT_NAME',
    );
  }
}
