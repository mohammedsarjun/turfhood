import type { OtpPurpose } from './otp-purpose.js';
/**
 * Payload of the otp session JWT that replaces client-supplied email/purpose. `exp` (the JWT's
 * own expiry) governs how long the pending-verification session survives and is deliberately
 * longer than the OTP code's own lifetime; `codeExpiresAt` (ms since epoch) is the current code's
 * actual expiry, carried as data so the page can still render an accurate countdown/expired state
 * after the code itself has lapsed but the session is still alive.
 */
export interface OtpSessionPayload {
    email: string;
    purpose: OtpPurpose;
    codeExpiresAt: number;
    typ: 'otp_session';
    iat?: number;
    exp?: number;
}
export interface OtpSessionResponse {
    maskedEmail: string;
    purpose: OtpPurpose;
    expiresAt: number;
}
