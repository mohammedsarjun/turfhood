import type { Response } from 'express';
import { env } from '@config/env';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
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

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    maxAge: parseExpiresInToMs(env.JWT_EXPIRES_IN),
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    maxAge: parseExpiresInToMs(env.REFRESH_TOKEN_EXPIRES_IN),
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });
}
