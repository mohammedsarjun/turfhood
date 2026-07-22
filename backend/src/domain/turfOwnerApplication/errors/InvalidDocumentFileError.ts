import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class InvalidDocumentFileError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, TurfOnboardingErrorCode.INVALID_DOCUMENT);
  }
}
