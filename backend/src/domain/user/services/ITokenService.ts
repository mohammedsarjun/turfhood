import type { AuthTokenPayload } from '@turfhood/shared';

export type { AuthTokenPayload };

export interface ITokenService {
  generateAccessToken(payload: AuthTokenPayload): string;
  verifyAccessToken(token: string): AuthTokenPayload;
}
