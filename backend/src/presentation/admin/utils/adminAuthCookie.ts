import type { Response } from 'express';
import { env } from '@config/env';

const ADMIN_ACCESS_TOKEN_COOKIE = 'adminAccessToken';
const ADMIN_REFRESH_TOKEN_COOKIE = 'adminRefreshToken';
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const UNIT_MS: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
const isProduction = process.env.NODE_ENV === 'production';

/** Parses jsonwebtoken-style durations ("1d", "15m", "30s") into milliseconds. */
function parseExpiresInToMs(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return DEFAULT_MAX_AGE_MS;
  const unit = UNIT_MS[match[2] as string];
  return Number(match[1]) * (unit ?? DEFAULT_MAX_AGE_MS);
}

/**
 * Separate cookie name from the regular `accessToken` — this is what makes admin and user
 * sessions structurally independent. `authenticate` never reads this cookie, and `adminOnly`
 * never reads `accessToken`.
 */
export function setAdminAuthCookie(res: Response, token: string): void {
  res.cookie(ADMIN_ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    maxAge: parseExpiresInToMs(env.JWT_EXPIRES_IN),
  });
}

export function clearAdminAuthCookie(res: Response): void {
  res.clearCookie(ADMIN_ACCESS_TOKEN_COOKIE, {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });
}

export function setAdminRefreshCookie(res: Response, token: string): void {
  res.cookie(ADMIN_REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    maxAge: parseExpiresInToMs(env.REFRESH_TOKEN_EXPIRES_IN),
  });
}

export function clearAdminRefreshCookie(res: Response): void {
  res.clearCookie(ADMIN_REFRESH_TOKEN_COOKIE, {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });
}
