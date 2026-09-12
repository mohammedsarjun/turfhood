import type { PaginatedResponse } from "../common/pagination.js";
export type NotificationType = "booking_cancelled_by_owner" | "booking_reminder" | "open_session_created";
export interface NotificationDTO {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    readAt?: string;
    createdAt: string;
}
export type NotificationFilter = "all" | "read";
export type NotificationListResponse = PaginatedResponse<NotificationDTO> & {
    unreadCount: number;
};
