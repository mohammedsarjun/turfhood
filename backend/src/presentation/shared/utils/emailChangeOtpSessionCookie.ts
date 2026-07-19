import type { Response } from 'express';

const EMAIL_CHANGE_OTP_SESSION_COOKIE = 'emailChangeOtpSession';

export function setEmailChangeOtpSessionCookie(
  res: Response,
  token: string,
  expiresInSeconds: number,
): void {
  res.cookie(EMAIL_CHANGE_OTP_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInSeconds * 1000,
  });
}

export function clearEmailChangeOtpSessionCookie(res: Response): void {
  res.clearCookie(EMAIL_CHANGE_OTP_SESSION_COOKIE, { path: '/' });
}
