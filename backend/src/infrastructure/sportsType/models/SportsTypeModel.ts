import mongoose, { Schema, model, type Model } from 'mongoose';
import type { ListedCatalogDocument } from '@infrastructure/shared/repositories/MongooseListedCatalogRepository';

export type SportsTypeDocument = ListedCatalogDocument;

const sportsTypeSchema = new Schema<SportsTypeDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, required: true, trim: true },
    isListed: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export const SportsTypeModel: Model<SportsTypeDocument> =
  (mongoose.models.SportsType as Model<SportsTypeDocument> | undefined) ??
  model<SportsTypeDocument>('SportsType', sportsTypeSchema);
