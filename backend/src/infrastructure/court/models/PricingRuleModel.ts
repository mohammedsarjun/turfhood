import mongoose, { Schema, model, type Document, type Model } from 'mongoose';
import { RAILWAY_TIME_PATTERN, type PricingDayType } from '@turfhood/shared';

export interface PricingRuleDocument extends Document {
  courtId: mongoose.Types.ObjectId;
  dayType: PricingDayType;
  startTime: string;
  endTime: string;
  pricePerSlot: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<PricingRuleDocument>(
  {
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    dayType: { type: String, enum: ['weekday', 'weekend'], required: true },
    startTime: { type: String, required: true, match: RAILWAY_TIME_PATTERN },
    endTime: { type: String, required: true, match: RAILWAY_TIME_PATTERN },
    pricePerSlot: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export const PricingRuleModel: Model<PricingRuleDocument> =
  (mongoose.models.PricingRule as Model<PricingRuleDocument> | undefined) ??
  model<PricingRuleDocument>('PricingRule', schema, 'pricing_rules');
