import type { Response } from 'express';

const OTP_SESSION_COOKIE = 'otpSession';

export function setOtpSessionCookie(res: Response, token: string, expiresInSeconds: number): void {
  res.cookie(OTP_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInSeconds * 1000,
  });
}

export function clearOtpSessionCookie(res: Response): void {
  res.clearCookie(OTP_SESSION_COOKIE, { path: '/' });
}
