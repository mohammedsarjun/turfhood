import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ISendOtpUseCase } from '@application/otp/use-cases/ISendOtpUseCase';
import type { IVerifyOtpUseCase } from '@application/otp/use-cases/IVerifyOtpUseCase';
import type { IGetOtpSessionUseCase } from '@application/otp/use-cases/IGetOtpSessionUseCase';
import { OTP_TOKENS } from '@domain/otp/tokens';
import { setAuthCookie } from '@presentation/shared/utils/authCookie';
import {
  setOtpSessionCookie,
  clearOtpSessionCookie,
} from '@presentation/shared/utils/otpSessionCookie';
import { env } from '@config/env';
import { HttpStatus } from '@shared/constants/httpStatus';

import type { OtpSessionRequest } from '../middlewares/requireOtpSession.js';

@injectable()
export class OtpController {
  constructor(
    @inject(OTP_TOKENS.SendOtpUseCase) private readonly sendOtpUseCase: ISendOtpUseCase,
    @inject(OTP_TOKENS.VerifyOtpUseCase) private readonly verifyOtpUseCase: IVerifyOtpUseCase,
    @inject(OTP_TOKENS.GetOtpSessionUseCase)
    private readonly getOtpSessionUseCase: IGetOtpSessionUseCase,
  ) {}

  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.sendOtpUseCase.execute(req.body);
      setOtpSessionCookie(res, result.otpSessionToken, env.OTP_SESSION_EXPIRY_SECONDS);
      res.status(HttpStatus.OK).json({ message: result.message, expiresInSeconds: result.expiresInSeconds });
    } catch (error) {
      next(error);
    }
  };

  getSession = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { otpSession } = req as OtpSessionRequest;
      const result = this.getOtpSessionUseCase.execute(otpSession!);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { otpSession } = req as OtpSessionRequest;
      const result = await this.verifyOtpUseCase.execute({
        otp: req.body.otp,
        email: otpSession!.email,
        purpose: otpSession!.purpose,
      });
      clearOtpSessionCookie(res);
      setAuthCookie(res, result.accessToken);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { otpSession } = req as OtpSessionRequest;
      const result = await this.sendOtpUseCase.execute({
        email: otpSession!.email,
        purpose: otpSession!.purpose,
      });
      setOtpSessionCookie(res, result.otpSessionToken, env.OTP_SESSION_EXPIRY_SECONDS);
      res.status(HttpStatus.OK).json({ message: result.message, expiresInSeconds: result.expiresInSeconds });
    } catch (error) {
      next(error);
    }
  };
}
