import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class TurfSuspendedError extends AppError {
  constructor(reason?: string) {
    super(
      reason ? `This turf is suspended. Reason: ${reason}` : 'This turf is suspended.',
      HttpStatus.FORBIDDEN,
      'TURF_SUSPENDED',
    );
  }
}
