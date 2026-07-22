import type { IRefreshTokenRepository } from '../../src/domain/refreshToken/repositories/IRefreshTokenRepository.js';
import { RefreshToken } from '../../src/domain/refreshToken/entities/RefreshToken.js';

/**
 * In-memory stand-in for the real Mongo-backed RefreshTokenRepository. Actually stores and
 * mutates records (unlike FakeUserRepository) since rotation/revocation logic depends on real
 * state transitions — mirrors FakePasswordResetTokenRepository's approach.
 */
export class FakeRefreshTokenRepository implements IRefreshTokenRepository {
  private records: RefreshToken[] = [];
  private nextId = 1;
  public readonly revokeCalls: { jti: string; replacedByJti?: string }[] = [];
  public readonly revokeAllForUserCalls: string[] = [];

  async create(token: RefreshToken): Promise<RefreshToken> {
    const stored = this.clone(token, { id: `refresh_${this.nextId++}`, createdAt: new Date() });
    this.records.push(stored);
    return stored;
  }

  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.records.find((r) => r.jti === jti) ?? null;
  }

  async revoke(jti: string, replacedByJti?: string): Promise<void> {
    this.revokeCalls.push({ jti, ...(replacedByJti ? { replacedByJti } : {}) });
    this.replace(jti, (record) =>
      this.clone(record, { revokedAt: new Date(), ...(replacedByJti ? { replacedByJti } : {}) }),
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    this.revokeAllForUserCalls.push(userId);
    this.records = this.records.map((record) =>
      record.userId === userId && !record.isRevoked()
        ? this.clone(record, { revokedAt: new Date() })
        : record,
    );
  }

  /** Test helper: directly seed a record without going through create(). */
  seed(record: RefreshToken): void {
    this.records.push(record);
  }

  private replace(jti: string, updater: (record: RefreshToken) => RefreshToken): void {
    this.records = this.records.map((record) => (record.jti === jti ? updater(record) : record));
  }

  private clone(
    record: RefreshToken,
    overrides: { id?: string; revokedAt?: Date; replacedByJti?: string; createdAt?: Date },
  ): RefreshToken {
    const id = overrides.id ?? record.id;
    const revokedAt = overrides.revokedAt ?? record.revokedAt;
    const replacedByJti = overrides.replacedByJti ?? record.replacedByJti;
    const createdAt = overrides.createdAt ?? record.createdAt;
    return RefreshToken.fromPersistence({
      ...(id !== undefined ? { id } : {}),
      userId: record.userId,
      jti: record.jti,
      expiresAt: record.expiresAt,
      ...(revokedAt !== undefined ? { revokedAt } : {}),
      ...(replacedByJti !== undefined ? { replacedByJti } : {}),
      ...(createdAt !== undefined ? { createdAt } : {}),
    });
  }
}
