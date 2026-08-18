import mongoose, { Schema, model, type Document, type Model } from 'mongoose';
import type { CourtStatus } from '@turfhood/shared';

export interface CourtDocument extends Document {
  turfId: mongoose.Types.ObjectId;
  name: string;
  normalizedName?: string;
  sportTypeIds: mongoose.Types.ObjectId[];
  capacity: number;
  status: CourtStatus;
  allowOpenSessions: boolean;
  minPlayersForOpenSession: number;
  slotDurationMinutes: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courtSchema = new Schema<CourtDocument>(
  {
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, trim: true },
    sportTypeIds: [{ type: Schema.Types.ObjectId, ref: 'SportsType', required: true }],
    capacity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['active', 'inactive', 'maintenance'], required: true },
    allowOpenSessions: { type: Boolean, required: true },
    minPlayersForOpenSession: { type: Number, required: true, min: 1 },
    slotDurationMinutes: { type: Number, required: true, min: 1 },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);
courtSchema.index(
  { turfId: 1, normalizedName: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false, normalizedName: { $type: 'string' } },
  },
);

export const CourtModel: Model<CourtDocument> =
  (mongoose.models.Court as Model<CourtDocument> | undefined) ??
  model<CourtDocument>('Court', courtSchema, 'courts');
