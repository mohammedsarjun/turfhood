import { injectable } from 'tsyringe';
import { PasswordResetToken } from '@domain/passwordReset/entities/PasswordResetToken';
import type { IPasswordResetTokenRepository } from '@domain/passwordReset/repositories/IPasswordResetTokenRepository';

import {
  PasswordResetTokenModel,
  type PasswordResetTokenDocument,
} from '../models/PasswordResetTokenModel.js';

@injectable()
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
  async create(token: PasswordResetToken): Promise<PasswordResetToken> {
    const doc = await PasswordResetTokenModel.create({
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
    });
    return this.toDomain(doc);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const doc = await PasswordResetTokenModel.findOne({ tokenHash }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async markConsumed(id: string): Promise<void> {
    await PasswordResetTokenModel.updateOne({ _id: id }, { $set: { consumedAt: new Date() } });
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    await PasswordResetTokenModel.updateMany(
      { userId, consumedAt: null },
      { $set: { consumedAt: new Date() } },
    );
  }

  private toDomain(doc: PasswordResetTokenDocument): PasswordResetToken {
    return PasswordResetToken.fromPersistence({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      tokenHash: doc.tokenHash,
      expiresAt: doc.expiresAt,
      ...(doc.consumedAt ? { consumedAt: doc.consumedAt } : {}),
      createdAt: doc.createdAt,
    });
  }
}
