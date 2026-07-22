import mongoose, { Schema, model, type Document, type Model } from 'mongoose';

export interface TurfImageDocument extends Document {
  turfId: mongoose.Types.ObjectId;
  url: string;
  isCover: boolean;
  order: number;
  createdAt: Date;
}

const turfImageSchema = new Schema<TurfImageDocument>(
  {
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true },
    url: { type: String, required: true },
    isCover: { type: Boolean, required: true, default: false },
    order: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const TurfImageModel: Model<TurfImageDocument> =
  (mongoose.models.TurfImage as Model<TurfImageDocument> | undefined) ??
  model<TurfImageDocument>('TurfImage', turfImageSchema);
