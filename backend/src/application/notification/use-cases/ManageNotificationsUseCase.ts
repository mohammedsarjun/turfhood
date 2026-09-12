import { inject, injectable } from 'tsyringe';
import type { NotificationFilter } from '@turfhood/shared';
import type {
  CreateNotificationInput,
  INotificationRepository,
} from '@domain/notification/repositories/INotificationRepository';
import { NOTIFICATION_TOKENS } from '@domain/notification/tokens';
import { NotificationNotFoundError } from '@domain/notification/errors/NotificationNotFoundError';

import type { IManageNotificationsUseCase } from './IManageNotificationsUseCase.js';

@injectable()
export class ManageNotificationsUseCase implements IManageNotificationsUseCase {
  constructor(
    @inject(NOTIFICATION_TOKENS.Repository)
    private readonly notifications: INotificationRepository,
  ) {}

  create(input: CreateNotificationInput) {
    return this.notifications.create(input);
  }

  async list(userId: string, page: number, limit: number, filter: NotificationFilter = 'all') {
    const result = await this.notifications.list(userId, page, limit, filter);
    return {
      items: result.items,
      unreadCount: result.unreadCount,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.notifications.markRead(id, userId);
    if (!notification) throw new NotificationNotFoundError();
    return notification;
  }

  notifyUpcomingBookingReminders(now = new Date()) {
    return this.notifications.notifyUpcomingBookingReminders(now);
  }
}
