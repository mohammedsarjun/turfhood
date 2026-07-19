import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import type { OtpSessionPayload } from '@turfhood/shared';
import { OtpSessionInvalidError } from '@domain/otp/errors/OtpSessionInvalidError';
import type {
  IOtpSessionTokenService,
  OtpSessionClaims,
  OtpSessionIdentity,
} from '@domain/otp/services/IOtpSessionTokenService';
import { env } from '@config/env';

const TOKEN_TYPE = 'otp_session' as const;

@injectable()
export class JwtOtpSessionTokenService implements IOtpSessionTokenService {
  generate(identity: OtpSessionIdentity, sessionExpiresInSeconds: number): string {
    const payload: Pick<OtpSessionPayload, 'email' | 'purpose' | 'codeExpiresAt' | 'typ'> = {
      email: identity.email,
      purpose: identity.purpose,
      codeExpiresAt: identity.codeExpiresAt,
      typ: TOKEN_TYPE,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: sessionExpiresInSeconds });
  }

  verify(token: string): OtpSessionClaims {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as OtpSessionPayload;
      if (decoded.typ !== TOKEN_TYPE) {
        throw new OtpSessionInvalidError();
      }
      return {
        email: decoded.email,
        purpose: decoded.purpose,
        codeExpiresAt: decoded.codeExpiresAt,
      };
    } catch {
      throw new OtpSessionInvalidError();
    }
  }
}
