import type { OtpPurpose } from '@turfhood/shared';

export interface OtpSessionIdentity {
  email: string;
  purpose: OtpPurpose;
  /** Ms-since-epoch expiry of the OTP code this session was issued for. */
  codeExpiresAt: number;
}

export type OtpSessionClaims = OtpSessionIdentity;

export interface IOtpSessionTokenService {
  /** `sessionExpiresInSeconds` governs the cookie/JWT's own lifetime — independent of codeExpiresAt. */
  generate(identity: OtpSessionIdentity, sessionExpiresInSeconds: number): string;
  verify(token: string): OtpSessionClaims;
}
