import type {
  NotificationDTO,
  NotificationFilter,
  NotificationListResponse,
} from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function listNotifications(
  filter: NotificationFilter = 'all',
): Promise<NotificationListResponse> {
  const response = await axiosInstance.get<NotificationListResponse>(API_ROUTES.notifications.base, {
    params: { filter, limit: 10 },
  });
  return response.data;
}

export async function markNotificationRead(id: string): Promise<NotificationDTO> {
  const response = await axiosInstance.patch<{ notification: NotificationDTO }>(
    API_ROUTES.notifications.read(id),
  );
  return response.data.notification;
}
