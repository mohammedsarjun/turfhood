import mongoose, { model, Schema, type Document, type Model } from 'mongoose';
import {
  RAILWAY_TIME_PATTERN,
  type AvailabilityOverrideReasonType,
  type AvailabilityPeriodDTO,
  type BlockedPeriodDTO,
} from '@turfhood/shared';

export interface AvailabilityOverrideDocument extends Document {
  turfId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  date: string;
  isClosed?: boolean;
  closureReason?: AvailabilityOverrideReasonType;
  customHours?: AvailabilityPeriodDTO[];
  blockedPeriods?: BlockedPeriodDTO[];
  type?: string;
  reasonType?: AvailabilityOverrideReasonType;
  customOpen?: string;
  customClose?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const periodSchema = new Schema(
  {
    startTime: { type: String, required: true, match: RAILWAY_TIME_PATTERN },
    endTime: { type: String, required: true, match: RAILWAY_TIME_PATTERN },
    reason: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false },
);

const schema = new Schema<AvailabilityOverrideDocument>(
  {
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    date: { type: String, required: true },
    isClosed: { type: Boolean },
    closureReason: {
      type: String,
      enum: ['holiday', 'maintenance', 'private_event', 'weather', 'other'],
    },
    customHours: { type: [periodSchema], default: undefined },
    blockedPeriods: { type: [periodSchema], default: [] },
    type: String,
    reasonType: {
      type: String,
      enum: ['holiday', 'maintenance', 'private_event', 'weather', 'other'],
    },
    customOpen: { type: String, match: RAILWAY_TIME_PATTERN },
    customClose: { type: String, match: RAILWAY_TIME_PATTERN },
    reason: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true, collection: 'availability_overrides' },
);

schema.index({ courtId: 1, date: 1 }, { unique: true });

export const AvailabilityOverrideModel: Model<AvailabilityOverrideDocument> =
  (mongoose.models.AvailabilityOverride as Model<AvailabilityOverrideDocument> | undefined) ??
  model<AvailabilityOverrideDocument>('AvailabilityOverride', schema);
