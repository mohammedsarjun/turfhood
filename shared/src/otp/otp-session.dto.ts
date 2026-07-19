import type { OtpPurpose } from './otp-purpose.js';

/** Payload of the short-lived otp session JWT that replaces client-supplied email/purpose. */
export interface OtpSessionPayload {
  email: string;
  purpose: OtpPurpose;
  typ: 'otp_session';
  iat?: number;
  exp?: number;
}

export interface OtpSessionResponse {
  maskedEmail: string;
  purpose: OtpPurpose;
  expiresAt: number;
}
