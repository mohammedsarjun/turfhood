import type { UserRole } from '../user/types.js';

/** JWT payload shape issued on login/verification, shared by both signing and verification. */
export interface AuthTokenPayload {
  userId: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}
