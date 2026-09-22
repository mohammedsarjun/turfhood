import type { NotificationDTO, NotificationFilter, NotificationType } from '@turfhood/shared';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  dedupeKey?: string;
}

export interface INotificationRepository {
  create(input: CreateNotificationInput): Promise<NotificationDTO | null>;
  list(
    userId: string,
    page: number,
    limit: number,
    filter: NotificationFilter,
  ): Promise<{ items: NotificationDTO[]; total: number; unreadCount: number }>;
  markRead(id: string, userId: string): Promise<NotificationDTO | null>;
  notifyUpcomingBookingReminders(now: Date): Promise<number>;
}
