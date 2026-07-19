import type {
  IOtpSessionTokenService,
  OtpSessionClaims,
  OtpSessionIdentity,
} from '../../src/domain/otp/services/IOtpSessionTokenService.js';

/** Deterministic stand-in for the real JWT-backed OtpSessionTokenService. */
export class FakeOtpSessionTokenService implements IOtpSessionTokenService {
  generate(identity: OtpSessionIdentity, expiresInSeconds: number): string {
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return JSON.stringify({ ...identity, exp });
  }

  verify(token: string): OtpSessionClaims {
    return JSON.parse(token) as OtpSessionClaims;
  }
}
