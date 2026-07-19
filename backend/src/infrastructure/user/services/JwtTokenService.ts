import jwt, { type SignOptions } from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import type { AuthTokenPayload, ITokenService } from '@domain/user/services/ITokenService';
import { TokenExpiredError } from '@domain/user/errors/TokenExpiredError';
import { TokenInvalidError } from '@domain/user/errors/TokenInvalidError';
import { env } from '@config/env';

@injectable()
export class JwtTokenService implements ITokenService {
  generateAccessToken(payload: AuthTokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  verifyAccessToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError();
      }
      throw new TokenInvalidError();
    }
  }
}
