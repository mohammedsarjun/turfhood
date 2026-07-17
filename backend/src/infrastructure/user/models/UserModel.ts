import { Schema, model, type Document, type Model } from 'mongoose';
import type { AuthProvider, UserRole, UserStatus } from '@domain/user/entities/User';

export interface UserDocument extends Document {
  name: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  authProviders: AuthProvider[];
  googleId?: string;
  roles: UserRole[];
  avatarUrl?: string;
  isVerified: boolean;
  status: UserStatus;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    // email/phone are each optional (one may be null for the other's signup path),
    // but must be unique when present — sparse index allows multiple nulls.
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, select: false },
    authProviders: {
      type: [String],
      enum: ['email', 'phone_otp', 'google'],
      required: true,
      default: [],
    },
    googleId: { type: String },
    roles: {
      type: [String],
      enum: ['customer', 'admin', 'turf_owner'],
      required: true,
      default: ['customer'],
    },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      required: true,
      default: 'active',
    },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
