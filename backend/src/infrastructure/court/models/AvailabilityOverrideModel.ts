import mongoose, { model, Schema, type Document, type Model } from 'mongoose';
import {
  RAILWAY_TIME_PATTERN,
  type AvailabilityOverrideReasonType,
  type BlockedSlotDTO,
} from '@turfhood/shared';

export interface AvailabilityOverrideDocument extends Document {
  turfId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  date: string;
  isClosed: boolean;
  closureReason?: AvailabilityOverrideReasonType;
  blockedSlots: BlockedSlotDTO[];
  createdAt: Date;
  updatedAt: Date;
}

const periodSchema = new Schema(
  {
    startTime: { type: String, required: true, match: RAILWAY_TIME_PATTERN },
    endTime: { type: String, required: true, match: RAILWAY_TIME_PATTERN },
  },
  { _id: false },
);

const schema = new Schema<AvailabilityOverrideDocument>(
  {
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    date: { type: String, required: true },
    isClosed: { type: Boolean, required: true, default: false },
    closureReason: {
      type: String,
      enum: ['holiday', 'maintenance', 'private_event', 'weather', 'other'],
    },
    blockedSlots: { type: [periodSchema], default: [] },
  },
  { timestamps: true, collection: 'availability_overrides' },
);

schema.index({ courtId: 1, date: 1 }, { unique: true });

export const AvailabilityOverrideModel: Model<AvailabilityOverrideDocument> =
  (mongoose.models.AvailabilityOverride as Model<AvailabilityOverrideDocument> | undefined) ??
  model<AvailabilityOverrideDocument>('AvailabilityOverride', schema);
