import type { Response } from 'express';
import { env } from '@config/env';

const EMAIL_CHANGE_OTP_SESSION_COOKIE = 'emailChangeOtpSession';
const isProduction = process.env.NODE_ENV === 'production';

export function setEmailChangeOtpSessionCookie(
  res: Response,
  token: string,
  expiresInSeconds: number,
): void {
  res.cookie(EMAIL_CHANGE_OTP_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    maxAge: expiresInSeconds * 1000,
  });
}

export function clearEmailChangeOtpSessionCookie(res: Response): void {
  res.clearCookie(EMAIL_CHANGE_OTP_SESSION_COOKIE, {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });
}
