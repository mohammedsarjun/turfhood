import type { RefreshToken } from '../entities/RefreshToken.js';

export interface IRefreshTokenRepository {
  create(token: RefreshToken): Promise<RefreshToken>;
  /** Looks up a record by jti regardless of its revoked/expired state — callers decide what "active" means. */
  findByJti(jti: string): Promise<RefreshToken | null>;
  /** Marks a record revoked; `replacedByJti` links it to the token that rotated it, if any. */
  revoke(jti: string, replacedByJti?: string): Promise<void>;
  /** Revokes every non-revoked token for a user — used on logout and on reuse-detection. */
  revokeAllForUser(userId: string): Promise<void>;
}
