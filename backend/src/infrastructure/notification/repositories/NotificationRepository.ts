import mongoose from 'mongoose';
import { inject, injectable } from 'tsyringe';
import type { NotificationDTO, NotificationFilter } from '@turfhood/shared';
import type {
  CreateNotificationInput,
  INotificationRepository,
} from '@domain/notification/repositories/INotificationRepository';
import { NOTIFICATION_TOKENS } from '@domain/notification/tokens';
import { BookingModel } from '@infrastructure/booking/models/BookingModel';
import { NotificationSocketGateway } from '../services/NotificationSocketGateway.js';
import { NotificationModel, type NotificationDocument } from '../models/NotificationModel.js';

const playTime = (date: string, time: string) => new Date(`${date}T${time}:00+05:30`);

@injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @inject(NOTIFICATION_TOKENS.SocketGateway)
    private readonly socketGateway: NotificationSocketGateway,
  ) {}

  async create(input: CreateNotificationInput): Promise<NotificationDTO | null> {
    try {
      const doc = await NotificationModel.create(input);
      const notification = this.toDTO(doc);
      const unreadCount = await NotificationModel.countDocuments({
        userId: input.userId,
        readAt: { $exists: false },
      });
      this.socketGateway.emitToUser(input.userId, notification, unreadCount);
      return notification;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: unknown }).code === 11000
      ) {
        return null;
      }
      throw error;
    }
  }

  async list(userId: string, page: number, limit: number, filter: NotificationFilter) {
    const baseFilter = {
      userId,
      ...(filter === 'read' ? { readAt: { $exists: true } } : {}),
    };
    const [docs, total, unreadCount] = await Promise.all([
      NotificationModel.find(baseFilter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      NotificationModel.countDocuments(baseFilter),
      NotificationModel.countDocuments({ userId, readAt: { $exists: false } }),
    ]);
    return { items: docs.map((doc) => this.toDTO(doc)), total, unreadCount };
  }

  async markRead(id: string, userId: string) {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { readAt: new Date() } },
      { new: true },
    );
    return doc ? this.toDTO(doc) : null;
  }

  async notifyUpcomingBookingReminders(now: Date) {
    const windowEnd = new Date(now.getTime() + 60_000);
    const dateKeys = [this.localDate(now), this.localDate(windowEnd)];
    const bookings = await BookingModel.find({
      bookingDate: { $in: [...new Set(dateKeys)] },
      status: 'confirmed',
    }).select('userId participantUserIds turfName courtName bookingDate slots');

    let created = 0;
    for (const booking of bookings) {
      const firstSlot = [...booking.slots].sort((left, right) =>
        left.startTime.localeCompare(right.startTime),
      )[0];
      if (!firstSlot) continue;
      const reminderAt = new Date(
        playTime(booking.bookingDate, firstSlot.startTime).getTime() - 10 * 60_000,
      );
      if (reminderAt < now || reminderAt >= windowEnd) continue;
      const recipients = [
        booking.userId.toString(),
        ...booking.participantUserIds.map((id) => id.toString()),
      ];
      for (const userId of [...new Set(recipients)]) {
        const notification = await this.create({
          userId,
          type: 'booking_reminder',
          title: 'Booking starts in 10 minutes',
          message: `${booking.turfName} - ${booking.courtName} starts at ${firstSlot.startTime}.`,
          link: `/bookings/${booking._id.toString()}`,
          dedupeKey: `booking-reminder:${booking._id.toString()}:${userId}`,
        });
        if (notification) created += 1;
      }
    }
    return created;
  }

  private localDate(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
  }

  private toDTO(doc: NotificationDocument): NotificationDTO {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      type: doc.type,
      title: doc.title,
      message: doc.message,
      ...(doc.link ? { link: doc.link } : {}),
      ...(doc.readAt ? { readAt: doc.readAt.toISOString() } : {}),
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
