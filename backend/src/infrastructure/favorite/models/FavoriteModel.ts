import mongoose, { model, Schema, type Document, type Model } from 'mongoose';

interface FavoriteDocument extends Document {
  userId: mongoose.Types.ObjectId;
  turfId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const schema = new Schema<FavoriteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
  },
  { timestamps: true, collection: 'favorites' },
);
schema.index({ userId: 1, turfId: 1 }, { unique: true });

export const FavoriteModel: Model<FavoriteDocument> =
  (mongoose.models.Favorite as Model<FavoriteDocument> | undefined) ??
  model<FavoriteDocument>('Favorite', schema);
