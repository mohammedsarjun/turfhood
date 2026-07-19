import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import type { AuthTokenPayload, ITokenService } from '@domain/user/services/ITokenService';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import { USER_TOKENS } from '@domain/user/tokens';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return cookies?.accessToken;
}

/** Verifies the request's JWT (Authorization header or accessToken cookie) before letting it reach a controller. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new TokenMissingError();
    }

    const tokenService = container.resolve<ITokenService>(USER_TOKENS.TokenService);
    const payload = tokenService.verifyAccessToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    next(error);
  }
}
