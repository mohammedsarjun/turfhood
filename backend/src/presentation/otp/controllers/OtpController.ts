import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { SendOtpUseCase } from '@application/otp/use-cases/SendOtpUseCase';
import { VerifyOtpUseCase } from '@application/otp/use-cases/VerifyOtpUseCase';

@injectable()
export class OtpController {
  constructor(
    @inject(SendOtpUseCase) private readonly sendOtpUseCase: SendOtpUseCase,
    @inject(VerifyOtpUseCase) private readonly verifyOtpUseCase: VerifyOtpUseCase,
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
