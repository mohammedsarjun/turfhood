import mongoose, { model, Schema, type Document, type Model } from 'mongoose';

export interface ReviewDocument extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  turfId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  customerName: string;
  turfName: string;
  courtName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ReviewDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    turfName: { type: String, required: true, trim: true },
    courtName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 3, maxlength: 1000 },
  },
  { timestamps: true, collection: 'reviews' },
);
schema.index({ turfId: 1, createdAt: -1 });
schema.index({ courtId: 1, createdAt: -1 });

export const ReviewModel: Model<ReviewDocument> =
  (mongoose.models.Review as Model<ReviewDocument> | undefined) ??
  model<ReviewDocument>('Review', schema);
