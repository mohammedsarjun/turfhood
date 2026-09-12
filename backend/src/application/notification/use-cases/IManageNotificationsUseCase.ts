import type { NotificationFilter, NotificationListResponse, NotificationDTO } from '@turfhood/shared';
import type { CreateNotificationInput } from '@domain/notification/repositories/INotificationRepository';

export interface IManageNotificationsUseCase {
  create(input: CreateNotificationInput): Promise<NotificationDTO | null>;
  list(
    userId: string,
    page: number,
    limit: number,
    filter?: NotificationFilter,
  ): Promise<NotificationListResponse>;
  markRead(userId: string, id: string): Promise<NotificationDTO>;
  notifyUpcomingBookingReminders(now?: Date): Promise<number>;
}
