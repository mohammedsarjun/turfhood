import mongoose, { Schema, model, Types, type Document, type Model } from 'mongoose';

export interface RefreshTokenDocument extends Document {
  userId: Types.ObjectId;
  jti: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByJti?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByJti: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

refreshTokenSchema.index({ userId: 1, createdAt: -1 });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel: Model<RefreshTokenDocument> =
  (mongoose.models.RefreshToken as Model<RefreshTokenDocument> | undefined) ??
  model<RefreshTokenDocument>('RefreshToken', refreshTokenSchema);
