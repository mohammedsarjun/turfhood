import { AppError } from '@shared/errors/AppError';
import { TurfOnboardingErrorCode } from '@turfhood/shared';

export class InvalidDocumentFileError extends AppError {
  constructor(message: string) {
    super(message, 400, TurfOnboardingErrorCode.INVALID_DOCUMENT);
  }
}
