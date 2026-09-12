import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';

export class NotificationNotFoundError extends AppError {
  constructor() {
    super('The notification was not found.', HttpStatus.NOT_FOUND, 'NOTIFICATION_NOT_FOUND');
  }
}
