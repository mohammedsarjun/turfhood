import mongoose, { Schema, model, Types, type Document, type Model } from 'mongoose';

export interface PasswordResetTokenDocument extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const passwordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

passwordResetTokenSchema.index({ userId: 1, createdAt: -1 });

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export const PasswordResetTokenModel: Model<PasswordResetTokenDocument> =
  (mongoose.models.PasswordResetToken as Model<PasswordResetTokenDocument> | undefined) ??
  model<PasswordResetTokenDocument>('PasswordResetToken', passwordResetTokenSchema);
