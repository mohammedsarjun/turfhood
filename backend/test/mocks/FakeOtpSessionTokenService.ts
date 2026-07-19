import type {
  IOtpSessionTokenService,
  OtpSessionClaims,
  OtpSessionIdentity,
} from '../../src/domain/otp/services/IOtpSessionTokenService.js';

/** Deterministic stand-in for the real JWT-backed OtpSessionTokenService. */
export class FakeOtpSessionTokenService implements IOtpSessionTokenService {
  generate(identity: OtpSessionIdentity): string {
    return JSON.stringify(identity);
  }

  verify(token: string): OtpSessionClaims {
    return JSON.parse(token) as OtpSessionClaims;
  }
}
