import mongoose, { Schema, model, type Document, type Model } from 'mongoose';
import type { BankAccountType } from '@turfhood/shared';

export interface BankAccountDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: BankAccountType;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<BankAccountDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountHolderName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },
    accountType: { type: String, enum: ['savings', 'current'], required: true },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true, collection: 'bankaccounts' },
);

schema.index({ ownerId: 1, accountNumber: 1, ifscCode: 1 }, { unique: true });

export const BankAccountModel: Model<BankAccountDocument> =
  (mongoose.models.BankAccount as Model<BankAccountDocument> | undefined) ??
  model<BankAccountDocument>('BankAccount', schema);
