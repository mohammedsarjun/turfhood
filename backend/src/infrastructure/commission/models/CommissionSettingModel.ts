import mongoose, { model, Schema, type Document, type Model } from 'mongoose';

export interface CommissionSettingDocument extends Document {
  key: 'platform_commission';
  basisPoints: number;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const schema = new Schema<CommissionSettingDocument>(
  {
    key: { type: String, enum: ['platform_commission'], required: true, unique: true },
    basisPoints: { type: Number, required: true, min: 100, max: 5_000 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'platform_settings' },
);

export const CommissionSettingModel: Model<CommissionSettingDocument> =
  (mongoose.models.CommissionSetting as Model<CommissionSettingDocument> | undefined) ??
  model<CommissionSettingDocument>('CommissionSetting', schema);
