import mongoose, { model, Schema, type Document, type Model } from 'mongoose';
export interface SlotReservationDocument extends Document {
  bookingId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  bookingDate: string;
  startTime: string;
  endTime: string;
  state: 'held' | 'confirmed';
  expiresAt?: Date;
}
const schema = new Schema<SlotReservationDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true },
    bookingDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    state: { type: String, enum: ['held', 'confirmed'], required: true },
    expiresAt: Date,
  },
  { timestamps: true, collection: 'slot_reservations' },
);
schema.index({ courtId: 1, bookingDate: 1, startTime: 1 }, { unique: true });
export const SlotReservationModel: Model<SlotReservationDocument> =
  (mongoose.models.SlotReservation as Model<SlotReservationDocument> | undefined) ??
  model<SlotReservationDocument>('SlotReservation', schema);
