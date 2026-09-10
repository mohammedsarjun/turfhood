import mongoose, { Schema, model, type Document, type Model } from 'mongoose';
import type { BankAccountType, WithdrawalRequestStatus } from '@turfhood/shared';

export interface WithdrawalRequestDocument extends Document {
  turfId: mongoose.Types.ObjectId;
  turfName: string;
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
  amountPaise: number;
  status: WithdrawalRequestStatus;
  bankAccount: {
    id: string;
    accountHolderName: string;
    bankName: string;
    accountNumber?: string;
    accountNumberMasked: string;
    ifscCode: string;
    accountType: BankAccountType;
    createdAt: Date;
  };
  paidAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<WithdrawalRequestDocument>(
  {
    turfId: { type: Schema.Types.ObjectId, ref: 'Turf', required: true, index: true },
    turfName: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerName: { type: String, required: true },
    amountPaise: { type: Number, required: true, min: 100 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'rejected'],
      default: 'pending',
      index: true,
    },
    bankAccount: {
      _id: false,
      id: { type: String, required: true },
      accountHolderName: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, trim: true },
      accountNumberMasked: { type: String, required: true },
      ifscCode: { type: String, required: true },
      accountType: { type: String, enum: ['savings', 'current'], required: true },
      createdAt: { type: Date, required: true },
    },
    paidAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true, collection: 'withdrawalrequests' },
);

export const WithdrawalRequestModel: Model<WithdrawalRequestDocument> =
  (mongoose.models.WithdrawalRequest as Model<WithdrawalRequestDocument> | undefined) ??
  model<WithdrawalRequestDocument>('WithdrawalRequest', schema);
