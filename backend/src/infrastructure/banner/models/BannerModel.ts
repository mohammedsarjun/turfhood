import mongoose, { model, Schema, type Document, type Model } from 'mongoose';

export interface BannerDocument extends Document {
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
}

const bannerSchema = new Schema<BannerDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 240 },
    imageUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const BannerModel: Model<BannerDocument> =
  (mongoose.models.Banner as Model<BannerDocument> | undefined) ??
  model<BannerDocument>('Banner', bannerSchema);
