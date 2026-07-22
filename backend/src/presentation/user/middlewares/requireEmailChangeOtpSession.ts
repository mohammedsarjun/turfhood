import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import type {
  OtpSessionClaims,
  IOtpSessionTokenService,
} from '@domain/otp/services/IOtpSessionTokenService';
import { OtpSessionInvalidError } from '@domain/otp/errors/OtpSessionInvalidError';
import { OTP_TOKENS } from '@domain/otp/tokens';

export interface EmailChangeOtpSessionRequest extends Request {
  emailChangeOtpSession?: OtpSessionClaims;
}

/**
 * Verifies the `emailChangeOtpSession` cookie — a distinct cookie from the signup/login
 * `otpSession` so an in-progress signup/login OTP flow and an in-progress email-change OTP
 * flow never collide for the same browser.
 */
export function requireEmailChangeOtpSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    const token = cookies?.emailChangeOtpSession;
    if (!token) {
      throw new OtpSessionInvalidError();
    }

    const otpSessionTokenService = container.resolve<IOtpSessionTokenService>(
      OTP_TOKENS.OtpSessionTokenService,
    );
    (req as EmailChangeOtpSessionRequest).emailChangeOtpSession =
      otpSessionTokenService.verify(token);
    next();
  } catch (error) {
    next(error);
  }
}
