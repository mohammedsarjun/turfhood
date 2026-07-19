import type { OtpPurpose } from '@turfhood/shared';

export interface OtpSessionIdentity {
  email: string;
  purpose: OtpPurpose;
}

export interface OtpSessionClaims extends OtpSessionIdentity {
  exp: number;
}

export interface IOtpSessionTokenService {
  generate(identity: OtpSessionIdentity, expiresInSeconds: number): string;
  verify(token: string): OtpSessionClaims;
}
