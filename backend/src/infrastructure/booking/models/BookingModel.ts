import mongoose, { model, Schema, type Document, type Model } from 'mongoose';
import type { BookingStatus, BookingTimelineEventType, PaymentStatus } from '@turfhood/shared';

export interface BookingDocument extends Document {
  reference: string;
  userId: mongoose.Types.ObjectId;
  turfId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  bookingDate: string;
  slots: Array<{ startTime: string; endTime: string; pricePaise: number }>;
  turfName: string;
  courtName: string;
  address: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  platformFeePaise: number;
  commissionBasisPoints: number;
  commissionPaise: number;
  ownerEarningsPaise: number;
  finalAmountPaise: number;
  currency: 'INR';
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  reservationExpiresAt?: Date;
  payuTransactionId: string;
  paymentId?: string;
  refund?: {
    requestToken: string;
    payuRequestId?: string;
    requestedAt?: Date;
    lastCheckedAt?: Date;
    completedAt?: Date;
    failureReason?: string;
    attemptCount: number;
  };
  timeline: Array<{
    type: BookingTimelineEventType;
    description: string;
    occurredAt: Date;
    actor?: 'system' | 'customer' | 'owner' | 'admin';
    attempt?: number;
  }>;
  confirmedAt?: Date;
  cancellation?: {
    actor: 'customer' | 'owner';
    reason?: string;
    cancelledAt: Date;
    refundPaise: number;
  };
  cancellationPolicy: {
    graceMinutes: number;
    fullRefundBeforeHours: number;
    partialRefundBeforeHours: number;
    partialRefundPercentage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const cancellationSchema = new Schema(
  {
    actor: { type: String, enum: ['customer', 'owner'], required: true },
    reason: String,
    cancelledAt: { type: Date, required: true },
    refundPaise: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const schema = new Schema<BookingDocument>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    bookingDate: { type: String, required: true, index: true },
    slots: [{ _id: false, startTime: String, endTime: String, pricePaise: Number }],
    turfName: String,
    courtName: String,
    address: String,
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    subtotalPaise: Number,
    discountPaise: Number,
    taxPaise: Number,
    platformFeePaise: Number,
    commissionBasisPoints: Number,
    commissionPaise: Number,
    ownerEarningsPaise: Number,
    finalAmountPaise: Number,
    currency: { type: String, enum: ['INR'], default: 'INR' },
    status: { type: String, required: true, index: true },
    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'paid',
        'failed',
        'refund_pending',
        'refund_failed',
        'refund_escalated',
        'refunded',
        'partially_refunded',
      ],
      required: true,
    },
    reservationExpiresAt: { type: Date, index: true },
    payuTransactionId: { type: String, required: true, unique: true },
    paymentId: String,
    refund: {
      _id: false,
      requestToken: String,
      payuRequestId: String,
      requestedAt: Date,
      lastCheckedAt: Date,
      completedAt: Date,
      failureReason: String,
      attemptCount: { type: Number, default: 0, min: 0 },
    },
    timeline: [
      {
        _id: false,
        type: { type: String, required: true },
        description: { type: String, required: true },
        occurredAt: { type: Date, required: true },
        actor: { type: String, enum: ['system', 'customer', 'owner', 'admin'] },
        attempt: Number,
      },
    ],
    confirmedAt: Date,
    cancellation: { type: cancellationSchema, default: undefined },
    cancellationPolicy: {
      _id: false,
      graceMinutes: Number,
      fullRefundBeforeHours: Number,
      partialRefundBeforeHours: Number,
      partialRefundPercentage: Number,
    },
  },
  { timestamps: true, collection: 'bookings' },
);
schema.index({ courtId: 1, bookingDate: 1 });
export const BookingModel: Model<BookingDocument> =
  (mongoose.models.Booking as Model<BookingDocument> | undefined) ??
  model<BookingDocument>('Booking', schema);
