import jwt, { type SignOptions } from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import type { AuthTokenPayload, ITokenService } from '@domain/user/services/ITokenService';
import { env } from '@config/env';

@injectable()
export class JwtTokenService implements ITokenService {
  generateAccessToken(payload: AuthTokenPayload): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']> };
    return jwt.sign(payload, env.JWT_SECRET, options);
  }
}
