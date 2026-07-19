import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import type { OtpSessionClaims, IOtpSessionTokenService } from '@domain/otp/services/IOtpSessionTokenService';
import { OtpSessionInvalidError } from '@domain/otp/errors/OtpSessionInvalidError';
import { OTP_TOKENS } from '@domain/otp/tokens';

export interface OtpSessionRequest extends Request {
  otpSession?: OtpSessionClaims;
}

/** Verifies the `otpSession` cookie (Express, Node runtime) before letting a request reach a controller. */
export function requireOtpSession(req: Request, _res: Response, next: NextFunction): void {
  try {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    const token = cookies?.otpSession;
    if (!token) {
      throw new OtpSessionInvalidError();
    }

    const otpSessionTokenService = container.resolve<IOtpSessionTokenService>(
      OTP_TOKENS.OtpSessionTokenService,
    );
    (req as OtpSessionRequest).otpSession = otpSessionTokenService.verify(token);
    next();
  } catch (error) {
    next(error);
  }
}
