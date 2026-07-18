import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ISendOtpUseCase } from '@application/otp/use-cases/ISendOtpUseCase';
import type { IVerifyOtpUseCase } from '@application/otp/use-cases/IVerifyOtpUseCase';
import { OTP_TOKENS } from '@domain/otp/tokens';

@injectable()
export class OtpController {
  constructor(
    @inject(OTP_TOKENS.SendOtpUseCase) private readonly sendOtpUseCase: ISendOtpUseCase,
    @inject(OTP_TOKENS.VerifyOtpUseCase) private readonly verifyOtpUseCase: IVerifyOtpUseCase,
  ) {}

  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.sendOtpUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.verifyOtpUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.sendOtpUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
