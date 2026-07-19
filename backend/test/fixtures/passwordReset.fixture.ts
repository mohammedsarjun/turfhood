import { createHash } from 'node:crypto';
import { PasswordResetToken } from '../../src/domain/passwordReset/entities/PasswordResetToken.js';

export const validRawToken = 'a'.repeat(64);
export const validTokenHash = createHash('sha256').update(validRawToken).digest('hex');

interface BuildPasswordResetTokenOverrides {
  id?: string;
  userId?: string;
  tokenHash?: string;
  expiresAt?: Date;
  consumedAt?: Date;
}

/** Builds an active (unconsumed) reset-token record. expiresAt defaults to 30 minutes in the future. */
export function buildPasswordResetToken(
  overrides: BuildPasswordResetTokenOverrides = {},
): PasswordResetToken {
  return PasswordResetToken.fromPersistence({
    id: overrides.id ?? 'reset_1',
    userId: overrides.userId ?? 'user_1',
    tokenHash: overrides.tokenHash ?? validTokenHash,
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 1_800_000),
    ...(overrides.consumedAt ? { consumedAt: overrides.consumedAt } : {}),
    createdAt: new Date(),
  });
}
