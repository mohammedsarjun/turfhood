import mongoose, { Schema, model, type Model } from 'mongoose';
import type { ListedCatalogDocument } from '@infrastructure/shared/repositories/MongooseListedCatalogRepository';

export type AmenityDocument = ListedCatalogDocument;

const amenitySchema = new Schema<AmenityDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, required: true, trim: true },
    isListed: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export const AmenityModel: Model<AmenityDocument> =
  (mongoose.models.Amenity as Model<AmenityDocument> | undefined) ??
  model<AmenityDocument>('Amenity', amenitySchema);
