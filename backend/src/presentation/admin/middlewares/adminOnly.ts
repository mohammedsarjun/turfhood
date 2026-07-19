import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import type { AuthTokenPayload, ITokenService } from '@domain/user/services/ITokenService';
import { AdminAccessRequiredError } from '@domain/admin/errors/AdminAccessRequiredError';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import { USER_TOKENS } from '@domain/user/tokens';

export interface AdminAuthenticatedRequest extends Request {
  admin?: AuthTokenPayload;
}

function extractAdminToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return cookies?.adminAccessToken;
}

/**
 * Verifies the request's JWT from the `adminAccessToken` cookie (never `accessToken` — that's
 * what keeps admin and regular user sessions fully separate) using the same ITokenService as
 * `authenticate`, then additionally requires the `admin` role claim. A structurally valid but
 * non-admin token is rejected with AdminAccessRequiredError, not silently downgraded.
 */
export function adminOnly(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractAdminToken(req);
    if (!token) {
      throw new TokenMissingError();
    }

    const tokenService = container.resolve<ITokenService>(USER_TOKENS.TokenService);
    const payload = tokenService.verifyAccessToken(token);

    if (!payload.roles.includes('admin')) {
      throw new AdminAccessRequiredError();
    }

    (req as AdminAuthenticatedRequest).admin = payload;
    next();
  } catch (error) {
    next(error);
  }
}
