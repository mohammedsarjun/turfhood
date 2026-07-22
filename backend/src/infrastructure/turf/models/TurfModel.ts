import mongoose, { Schema, model, type Document, type Model } from 'mongoose';
import type { GeoPoint } from '@turfhood/shared/';
import type {
  TurfAddress,
  TurfAmenityRef,
  TurfRating,
  TurfStatus,
} from '@domain/turf/entities/Turf';

export interface TurfDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  location: GeoPoint;
  address: TurfAddress;
  amenities: TurfAmenityRef[];
  sportsOffered: mongoose.Types.ObjectId[];
  rating: TurfRating;
  status: TurfStatus;
  verificationId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const turfSchema = new Schema<TurfDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    },
    address: {
      line1: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      cityCode: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      stateCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      countryCode: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    amenities: [
      {
        _id: false,
        amenityId: { type: Schema.Types.ObjectId, ref: 'Amenity', required: true },
        name: { type: String, required: true },
      },
    ],
    sportsOffered: [{ type: Schema.Types.ObjectId, ref: 'SportsType', required: true }],
    rating: {
      avg: { type: Number, required: true, default: 0 },
      count: { type: Number, required: true, default: 0 },
    },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected', 'suspended'],
      required: true,
      default: 'approved',
    },
    verificationId: { type: Schema.Types.ObjectId, ref: 'TurfOwnerApplication' },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

turfSchema.index({ location: '2dsphere' });

export const TurfModel: Model<TurfDocument> =
  (mongoose.models.Turf as Model<TurfDocument> | undefined) ??
  // Explicit collection name: Mongoose's default pluralization turns "Turf" into "turves"
  // (the "-f" -> "-ves" English rule, like "leaf" -> "leaves"), not "turfs".
  model<TurfDocument>('Turf', turfSchema, 'turfs');
