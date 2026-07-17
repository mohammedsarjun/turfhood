import mongoose, { Schema, model, Types, type Document, type Model } from 'mongoose';
import type { OtpPurpose } from '@turfhub/shared';

export interface OtpDocument extends Document {
  userId: Types.ObjectId;
  email: string;
  purpose: OtpPurpose;
  otpHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  attemptCount: number;
  createdAt: Date;
}

const otpSchema = new Schema<OtpDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: ['signup', 'login'], required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
    attemptCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

otpSchema.index({ email: 1, purpose: 1, createdAt: -1 });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export const OtpModel: Model<OtpDocument> =
  (mongoose.models.OtpVerification as Model<OtpDocument> | undefined) ??
  model<OtpDocument>('OtpVerification', otpSchema);
