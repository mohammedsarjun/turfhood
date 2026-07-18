import { User } from '../../src/domain/user/entities/User.js';
import { Email } from '../../src/domain/user/value-objects/Email.js';
import { Phone } from '../../src/domain/user/value-objects/Phone.js';
import { OtpVerification } from '../../src/domain/otp/entities/OtpVerification.js';
import type { OtpPurpose } from '@turfhood/shared';

export const validOtp = '123456';

/** A persisted user (has an id) with isVerified: false, ready to be OTP-verified. */
export function buildUnverifiedUser(overrides: { email?: string; phone?: string; id?: string } = {}): User {
  return User.fromPersistence({
    id: overrides.id ?? 'user_1',
    name: 'Jordan Lee',
    email: Email.create(overrides.email ?? 'jordan@example.com'),
    phone: Phone.create(overrides.phone ?? '9123456780'),
    passwordHash: 'hashed-password1',
    authProviders: ['email'],
    roles: ['customer'],
    isVerified: false,
    status: 'active',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

/** A persisted, already-verified user — used for LoginUserUseCase's success-path tests. */
export function buildVerifiedUser(overrides: { email?: string; phone?: string; id?: string } = {}): User {
  return User.fromPersistence({
    id: overrides.id ?? 'user_1',
    name: 'Jordan Lee',
    email: Email.create(overrides.email ?? 'jordan@example.com'),
    phone: Phone.create(overrides.phone ?? '9123456780'),
    passwordHash: 'hashed-password1',
    authProviders: ['email'],
    roles: ['customer'],
    isVerified: true,
    status: 'active',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

interface BuildOtpRecordOverrides {
  id?: string;
  userId?: string;
  email?: string;
  purpose?: OtpPurpose;
  otpHash?: string;
  expiresAt?: Date;
  consumedAt?: Date;
  attemptCount?: number;
}

/** Builds an active (unconsumed) OTP record. expiresAt defaults to 60s in the future. */
export function buildOtpRecord(overrides: BuildOtpRecordOverrides = {}): OtpVerification {
  return OtpVerification.fromPersistence({
    id: overrides.id ?? 'otp_1',
    userId: overrides.userId ?? 'user_1',
    email: overrides.email ?? 'jordan@example.com',
    purpose: overrides.purpose ?? 'login',
    otpHash: overrides.otpHash ?? `hashed-${validOtp}`,
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60_000),
    ...(overrides.consumedAt ? { consumedAt: overrides.consumedAt } : {}),
    attemptCount: overrides.attemptCount ?? 0,
    createdAt: new Date(),
  });
}
