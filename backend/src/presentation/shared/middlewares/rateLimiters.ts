import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '@shared/errors/TooManyRequestsError';

const MINUTE_MS = 60 * 1000;

/**
 * Shared factory so every limiter reports through the same centralized errorHandler
 * (same {message, code} shape as every other AppError) instead of express-rate-limit's
 * default plain-text response.
 */
/** Exported for isolated unit testing — see test/unit/middlewares/rateLimiters.test.ts. */
export function createRateLimiter(options: { windowMs: number; limit: number; message?: string }) {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: true,
    legacyHeaders: false,
    // The test suite hits these same routes far more than any real client would within a
    // window (e.g. one login test file alone makes 8 login POSTs); a real per-IP limiter
    // would make the test suite flaky rather than testing anything meaningful. Disabled only
    // under NODE_ENV=test (set in test/setup.ts before the app is imported) — fully active
    // in development and production.
    skip: () => process.env.NODE_ENV === 'test',
    handler: (_req, _res, next) => {
      next(new TooManyRequestsError(options.message));
    },
  });
}

/**
 * Credential-guessing surfaces: regular login, Google login, and the authenticated
 * current-password check on change-password. 5 attempts per 15 minutes per IP.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * MINUTE_MS,
  limit: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

/** Admin login is the highest-value credential-guessing target — the strictest limiter. */
export const adminAuthRateLimiter = createRateLimiter({
  windowMs: 15 * MINUTE_MS,
  limit: 5,
  message: 'Too many admin login attempts. Please try again in 15 minutes.',
});

/**
 * OTP send/verify/resend and email-change request/confirm — bounds both spamming a mailbox
 * with codes and brute-forcing a code, on top of the existing per-code attempt cap.
 */
export const otpRateLimiter = createRateLimiter({
  windowMs: 15 * MINUTE_MS,
  limit: 8,
  message: 'Too many attempts. Please wait a few minutes before trying again.',
});

/** Signup: bounds automated account creation. 10 per hour per IP. */
export const signupRateLimiter = createRateLimiter({
  windowMs: 60 * MINUTE_MS,
  limit: 10,
  message: 'Too many signup attempts. Please try again later.',
});

/** Password-reset request/reset: bounds mailbox spam and reset-token guessing. */
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * MINUTE_MS,
  limit: 5,
  message: 'Too many password reset attempts. Please try again later.',
});

export const bookingRateLimiter = createRateLimiter({
  windowMs: 10 * MINUTE_MS,
  limit: 10,
  message: 'Too many booking attempts. Please wait before trying again.',
});

export const paymentCallbackRateLimiter = createRateLimiter({
  windowMs: MINUTE_MS,
  limit: 60,
  message: 'Too many payment callbacks. Please try again shortly.',
});
