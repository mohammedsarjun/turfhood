import { injectable } from 'tsyringe';
import type { OtpPurpose } from '@turfhub/shared';
import { OtpVerification } from '@domain/otp/entities/OtpVerification';
import type { IOtpRepository } from '@domain/otp/repositories/IOtpRepository';
import type { Email } from '@domain/user/value-objects/Email';

import { OtpModel, type OtpDocument } from '../models/OtpModel.js';

@injectable()
export class OtpRepository implements IOtpRepository {
  async create(otp: OtpVerification): Promise<OtpVerification> {
    const doc = await OtpModel.create({
      userId: otp.userId,
      email: otp.email,
      purpose: otp.purpose,
      otpHash: otp.otpHash,
      expiresAt: otp.expiresAt,
      attemptCount: otp.attemptCount,
    });
    return this.toDomain(doc);
  }

  async findLatestActiveByEmail(email: Email, purpose: OtpPurpose): Promise<OtpVerification | null> {
    const doc = await OtpModel.findOne({ email: email.toString(), purpose, consumedAt: null })
      .sort({ createdAt: -1 })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async incrementAttemptCount(id: string): Promise<void> {
    await OtpModel.updateOne({ _id: id }, { $inc: { attemptCount: 1 } });
  }

  async markConsumed(id: string): Promise<void> {
    await OtpModel.updateOne({ _id: id }, { $set: { consumedAt: new Date() } });
  }

  async invalidateAllForEmail(email: Email, purpose: OtpPurpose): Promise<void> {
    await OtpModel.updateMany(
      { email: email.toString(), purpose, consumedAt: null },
      { $set: { consumedAt: new Date() } },
    );
  }

  private toDomain(doc: OtpDocument): OtpVerification {
    return OtpVerification.fromPersistence({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      email: doc.email,
      purpose: doc.purpose,
      otpHash: doc.otpHash,
      expiresAt: doc.expiresAt,
      ...(doc.consumedAt ? { consumedAt: doc.consumedAt } : {}),
      attemptCount: doc.attemptCount,
      createdAt: doc.createdAt,
    });
  }
}
