import mongoose, { Schema, model, type Document, type Model } from 'mongoose';
import type { GeoPoint } from '@turfhood/shared';
import type { TurfAddress } from '@domain/turf/entities/Turf';
import type {
  TurfOwnerApplicationDocument as ApplicationDocumentRef,
  TurfOwnerApplicationImage,
  TurfOwnerApplicationStatus,
} from '@domain/turfOwnerApplication/entities/TurfOwnerApplication';

export interface TurfOwnerApplicationDocument extends Document {
  applicantUserId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  address: TurfAddress;
  location: GeoPoint;
  sportsOffered: mongoose.Types.ObjectId[];
  amenities: mongoose.Types.ObjectId[];
  documents: ApplicationDocumentRef[];
  images: TurfOwnerApplicationImage[];
  status: TurfOwnerApplicationStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  turfId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const turfOwnerApplicationSchema = new Schema<TurfOwnerApplicationDocument>(
  {
    applicantUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
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
    location: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true },
    },
    sportsOffered: [{ type: Schema.Types.ObjectId, ref: 'SportsType', required: true }],
    amenities: [{ type: Schema.Types.ObjectId, ref: 'Amenity' }],
    documents: [
      {
        _id: false,
        type: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    images: [
      {
        _id: false,
        url: { type: String, required: true },
        isCover: { type: Boolean, required: true, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true,
      default: 'pending',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: { type: String, trim: true },
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf' },
  },
  { timestamps: true },
);

turfOwnerApplicationSchema.index({ location: '2dsphere' });

export const TurfOwnerApplicationModel: Model<TurfOwnerApplicationDocument> =
  (mongoose.models.TurfOwnerApplication as Model<TurfOwnerApplicationDocument> | undefined) ??
  model<TurfOwnerApplicationDocument>('TurfOwnerApplication', turfOwnerApplicationSchema);
