import mongoose, { Schema, model, type Document, type Model } from 'mongoose';

export interface CourtImageDocument extends Document {
  courtId: mongoose.Types.ObjectId;
  turfId: mongoose.Types.ObjectId;
  url: string;
  isCover: boolean;
  order: number;
  createdAt: Date;
}

const schema = new Schema<CourtImageDocument>(
  {
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
    url: { type: String, required: true },
    isCover: { type: Boolean, required: true, default: false },
    order: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const CourtImageModel: Model<CourtImageDocument> =
  (mongoose.models.CourtImage as Model<CourtImageDocument> | undefined) ??
  model<CourtImageDocument>('CourtImage', schema, 'court_images');
