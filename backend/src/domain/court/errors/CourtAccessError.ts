import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class CourtAccessError extends AppError {
  constructor(message = 'The requested turf was not found.') {
    super(message, HttpStatus.NOT_FOUND, 'COURT_TURF_NOT_FOUND');
  }
}
