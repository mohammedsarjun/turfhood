import type { IPasswordResetTokenRepository } from '../../src/domain/passwordReset/repositories/IPasswordResetTokenRepository.js';
import { PasswordResetToken } from '../../src/domain/passwordReset/entities/PasswordResetToken.js';

/**
 * In-memory stand-in for the real Mongo-backed PasswordResetTokenRepository.
 * Actually stores and mutates records (unlike FakeUserRepository) since
 * token business rules (consumption, invalidation) depend on real state
 * transitions — mirrors FakeOtpRepository's approach.
 */
export class FakePasswordResetTokenRepository implements IPasswordResetTokenRepository {
  private records: PasswordResetToken[] = [];
  private nextId = 1;
  public readonly invalidateAllForUserCalls: string[] = [];

  async create(token: PasswordResetToken): Promise<PasswordResetToken> {
    const stored = this.clone(token, { id: `reset_${this.nextId++}`, createdAt: new Date() });
    this.records.push(stored);
    return stored;
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.records.find((r) => r.tokenHash === tokenHash) ?? null;
  }

  async markConsumed(id: string): Promise<void> {
    this.replace(id, (record) => this.clone(record, { consumedAt: new Date() }));
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    this.invalidateAllForUserCalls.push(userId);
    this.records = this.records.map((record) =>
      record.userId === userId && !record.isConsumed()
        ? this.clone(record, { consumedAt: new Date() })
        : record,
    );
  }

  /** Test helper: directly seed a record without going through create(). */
  seed(record: PasswordResetToken): void {
    this.records.push(record);
  }

  private replace(id: string, updater: (record: PasswordResetToken) => PasswordResetToken): void {
    this.records = this.records.map((record) => (record.id === id ? updater(record) : record));
  }

  private clone(
    record: PasswordResetToken,
    overrides: { id?: string; consumedAt?: Date; createdAt?: Date },
  ): PasswordResetToken {
    const id = overrides.id ?? record.id;
    const consumedAt = overrides.consumedAt ?? record.consumedAt;
    const createdAt = overrides.createdAt ?? record.createdAt;
    return PasswordResetToken.fromPersistence({
      ...(id !== undefined ? { id } : {}),
      userId: record.userId,
      tokenHash: record.tokenHash,
      expiresAt: record.expiresAt,
      ...(consumedAt !== undefined ? { consumedAt } : {}),
      ...(createdAt !== undefined ? { createdAt } : {}),
    });
  }
}
