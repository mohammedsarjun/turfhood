import type { RefreshTokenPayload } from '@turfhood/shared';

export interface GenerateRefreshTokenInput {
  userId: string;
  roles: RefreshTokenPayload['roles'];
}

export interface GenerateRefreshTokenResult {
  token: string;
  jti: string;
  expiresAt: Date;
}

export interface IRefreshTokenService {
  generate(input: GenerateRefreshTokenInput): GenerateRefreshTokenResult;
  verify(token: string): RefreshTokenPayload;
}
