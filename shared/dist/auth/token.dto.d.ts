import type { UserRole } from '../user/types.js';
/** JWT payload shape issued on login/verification, shared by both signing and verification. */
export interface AuthTokenPayload {
    userId: string;
    roles: UserRole[];
    iat?: number;
    exp?: number;
}
/** JWT payload shape for refresh tokens — `jti` identifies the persisted record for revocation. */
export interface RefreshTokenPayload {
    userId: string;
    roles: UserRole[];
    jti: string;
    iat?: number;
    exp?: number;
}
