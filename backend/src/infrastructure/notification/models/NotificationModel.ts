import mongoose, { model, Schema, type Document, type Model } from 'mongoose';
import type { NotificationType } from '@turfhood/shared';

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  readAt?: Date;
  dedupeKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['booking_cancelled_by_owner', 'booking_reminder', 'open_session_created'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    readAt: { type: Date },
    dedupeKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true, collection: 'notifications' },
);

schema.index({ userId: 1, createdAt: -1 });
schema.index({ userId: 1, readAt: 1, createdAt: -1 });

export const NotificationModel: Model<NotificationDocument> =
  (mongoose.models.Notification as Model<NotificationDocument> | undefined) ??
  model<NotificationDocument>('Notification', schema);
