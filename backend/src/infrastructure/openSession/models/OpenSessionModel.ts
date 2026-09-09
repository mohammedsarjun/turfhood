import mongoose, { model, Schema, type Document, type Model } from 'mongoose';
import type { OpenSessionStatus } from '@turfhood/shared';

export interface OpenSessionDocument extends Document {
  creatorId: mongoose.Types.ObjectId;
  turfId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  turfName: string;
  courtName: string;
  courtImage?: string;
  address: string;
  location: { type: 'Point'; coordinates: [number, number] };
  sportTypeId: mongoose.Types.ObjectId;
  sportName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  minimumPlayers: number;
  maximumPlayers: number;
  totalPricePaise: number;
  pricePerParticipantPaise: number;
  status: OpenSessionStatus;
  fillDeadline: Date;
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    name: string;
    isCreator: boolean;
    transactionId: string;
    paymentId?: string;
    refundRequestId?: string;
    refundReason?: string;
    refundAttemptCount?: number;
    refundFailureReason?: string;
    refundRequestedAt?: Date;
    refundedAt?: Date;
    paymentStatus: 'pending' | 'paid' | 'refund_pending' | 'refunded' | 'refund_failed';
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<OpenSessionDocument>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    turfName: { type: String, required: true },
    courtName: { type: String, required: true },
    courtImage: String,
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    sportTypeId: { type: Schema.Types.ObjectId, ref: 'SportsType', required: true, index: true },
    sportName: { type: String, required: true },
    bookingDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    minimumPlayers: { type: Number, required: true, min: 1 },
    maximumPlayers: { type: Number, required: true, min: 1 },
    totalPricePaise: { type: Number, required: true, min: 1 },
    pricePerParticipantPaise: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['awaiting_creator_payment', 'open', 'full', 'confirmed', 'cancelled', 'completed'],
      required: true,
      index: true,
    },
    fillDeadline: { type: Date, required: true, index: true },
    participants: [
      {
        _id: false,
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        isCreator: { type: Boolean, required: true },
        transactionId: { type: String, required: true },
        paymentId: String,
        refundRequestId: String,
        refundReason: String,
        refundAttemptCount: { type: Number, min: 0, default: 0 },
        refundFailureReason: String,
        refundRequestedAt: Date,
        refundedAt: Date,
        paymentStatus: {
          type: String,
          enum: ['pending', 'paid', 'refund_pending', 'refunded', 'refund_failed'],
          required: true,
        },
        joinedAt: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true, collection: 'open_sessions' },
);
schema.index({ location: '2dsphere' });
schema.index({ 'participants.transactionId': 1 });
export const OpenSessionModel: Model<OpenSessionDocument> =
  (mongoose.models.OpenSession as Model<OpenSessionDocument> | undefined) ??
  model<OpenSessionDocument>('OpenSession', schema);
