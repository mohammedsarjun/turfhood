import type { Response } from 'express';
import { env } from '@config/env';

const OTP_SESSION_COOKIE = 'otpSession';
const isProduction = process.env.NODE_ENV === 'production';

export function setOtpSessionCookie(res: Response, token: string, expiresInSeconds: number): void {
  res.cookie(OTP_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    maxAge: expiresInSeconds * 1000,
  });
}

export function clearOtpSessionCookie(res: Response): void {
  res.clearCookie(OTP_SESSION_COOKIE, {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });
}
