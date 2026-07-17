import type { OtpPurpose } from '@turfhub/shared';
import type { IOtpRepository } from '../../src/domain/otp/repositories/IOtpRepository.js';
import { OtpVerification } from '../../src/domain/otp/entities/OtpVerification.js';
import type { Email } from '../../src/domain/user/value-objects/Email.js';

/**
 * In-memory stand-in for the real Mongo-backed OtpRepository. Actually stores
 * and mutates records (unlike FakeUserRepository) since OTP business rules
 * (attempt counts, consumption, invalidation) depend on real state transitions.
 */
export class FakeOtpRepository implements IOtpRepository {
  private records: OtpVerification[] = [];
  private nextId = 1;
  public readonly invalidateAllForEmailCalls: Array<{ email: string; purpose: OtpPurpose }> = [];

  async create(otp: OtpVerification): Promise<OtpVerification> {
    const stored = this.clone(otp, { id: `otp_${this.nextId++}`, createdAt: new Date() });
    this.records.push(stored);
    return stored;
  }

  async findLatestActiveByEmail(email: Email, purpose: OtpPurpose): Promise<OtpVerification | null> {
    const active = this.records
      .filter((r) => r.email === email.toString() && r.purpose === purpose && !r.isConsumed())
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    return active[0] ?? null;
  }

  async incrementAttemptCount(id: string): Promise<void> {
    this.replace(id, (record) => this.clone(record, { attemptCount: record.attemptCount + 1 }));
  }

  async markConsumed(id: string): Promise<void> {
    this.replace(id, (record) => this.clone(record, { consumedAt: new Date() }));
  }

  async invalidateAllForEmail(email: Email, purpose: OtpPurpose): Promise<void> {
    this.invalidateAllForEmailCalls.push({ email: email.toString(), purpose });
    this.records = this.records.map((record) =>
      record.email === email.toString() && record.purpose === purpose && !record.isConsumed()
        ? this.clone(record, { consumedAt: new Date() })
        : record,
    );
  }

  /** Test helper: directly seed a record without going through create(). */
  seed(record: OtpVerification): void {
    this.records.push(record);
  }

  private replace(id: string, updater: (record: OtpVerification) => OtpVerification): void {
    this.records = this.records.map((record) => (record.id === id ? updater(record) : record));
  }

  private clone(
    record: OtpVerification,
    overrides: { id?: string; consumedAt?: Date; attemptCount?: number; createdAt?: Date },
  ): OtpVerification {
    const id = overrides.id ?? record.id;
    const consumedAt = overrides.consumedAt ?? record.consumedAt;
    const createdAt = overrides.createdAt ?? record.createdAt;
    return OtpVerification.fromPersistence({
      ...(id !== undefined ? { id } : {}),
      userId: record.userId,
      email: record.email,
      purpose: record.purpose,
      otpHash: record.otpHash,
      expiresAt: record.expiresAt,
      ...(consumedAt !== undefined ? { consumedAt } : {}),
      attemptCount: overrides.attemptCount ?? record.attemptCount,
      ...(createdAt !== undefined ? { createdAt } : {}),
    });
  }
}
