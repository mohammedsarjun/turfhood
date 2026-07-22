/** Default OTP validity window in seconds — the single source of truth shared by frontend and backend defaults. */
export const DEFAULT_OTP_EXPIRY_SECONDS = 60;

/**
 * Default lifetime of the otp-session cookie itself, in seconds. Deliberately longer than
 * DEFAULT_OTP_EXPIRY_SECONDS: the session identifies "this browser has a pending verification
 * for email X" and must outlive any single code so a refresh after the code expires still shows
 * the OTP page (with a resend option) instead of bouncing to /login.
 */
export const DEFAULT_OTP_SESSION_EXPIRY_SECONDS = 600;
