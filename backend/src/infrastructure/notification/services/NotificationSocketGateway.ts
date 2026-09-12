import type { Server } from 'socket.io';
import type { NotificationDTO } from '@turfhood/shared';

export class NotificationSocketGateway {
  private io?: Server;

  attach(io: Server): void {
    this.io = io;
  }

  emitToUser(userId: string, notification: NotificationDTO, unreadCount: number): void {
    this.io?.to(`user:${userId}`).emit('notification:new', { notification, unreadCount });
  }
}
