import { randomUUID } from 'node:crypto';

import jwt, { type SignOptions } from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import type { RefreshTokenPayload } from '@turfhood/shared';
import type {
  GenerateRefreshTokenInput,
  GenerateRefreshTokenResult,
  IRefreshTokenService,
} from '@domain/refreshToken/services/IRefreshTokenService';
import { RefreshTokenExpiredError } from '@domain/refreshToken/errors/RefreshTokenExpiredError';
import { RefreshTokenInvalidError } from '@domain/refreshToken/errors/RefreshTokenInvalidError';
import { env } from '@config/env';

@injectable()
export class JwtRefreshTokenService implements IRefreshTokenService {
  generate(input: GenerateRefreshTokenInput): GenerateRefreshTokenResult {
    const jti = randomUUID();
    const options: SignOptions = {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
    };
    const token = jwt.sign(
      { userId: input.userId, roles: input.roles, jti },
      env.REFRESH_TOKEN_SECRET,
      options,
    );
    const { exp } = jwt.decode(token) as { exp: number };
    return { token, jti, expiresAt: new Date(exp * 1000) };
  }

  verify(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new RefreshTokenExpiredError();
      }
      throw new RefreshTokenInvalidError();
    }
  }
}
