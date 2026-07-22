import { injectable } from 'tsyringe';
import { RefreshToken } from '@domain/refreshToken/entities/RefreshToken';
import type { IRefreshTokenRepository } from '@domain/refreshToken/repositories/IRefreshTokenRepository';

import { RefreshTokenModel, type RefreshTokenDocument } from '../models/RefreshTokenModel.js';

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(token: RefreshToken): Promise<RefreshToken> {
    const doc = await RefreshTokenModel.create({
      userId: token.userId,
      jti: token.jti,
      expiresAt: token.expiresAt,
    });
    return this.toDomain(doc);
  }

  async findByJti(jti: string): Promise<RefreshToken | null> {
    const doc = await RefreshTokenModel.findOne({ jti }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async revoke(jti: string, replacedByJti?: string): Promise<void> {
    await RefreshTokenModel.updateOne(
      { jti },
      { $set: { revokedAt: new Date(), ...(replacedByJti ? { replacedByJti } : {}) } },
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  private toDomain(doc: RefreshTokenDocument): RefreshToken {
    return RefreshToken.fromPersistence({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      jti: doc.jti,
      expiresAt: doc.expiresAt,
      ...(doc.revokedAt ? { revokedAt: doc.revokedAt } : {}),
      ...(doc.replacedByJti ? { replacedByJti: doc.replacedByJti } : {}),
      createdAt: doc.createdAt,
    });
  }
}
