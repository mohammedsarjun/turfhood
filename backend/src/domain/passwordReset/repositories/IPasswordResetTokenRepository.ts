import type { PasswordResetToken } from '../entities/PasswordResetToken.js';

export interface IPasswordResetTokenRepository {
  create(token: PasswordResetToken): Promise<PasswordResetToken>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  markConsumed(id: string): Promise<void>;
  invalidateAllForUser(userId: string): Promise<void>;
}
