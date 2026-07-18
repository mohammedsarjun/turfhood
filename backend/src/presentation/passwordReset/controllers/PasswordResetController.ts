import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { RequestPasswordResetUseCase } from '@application/passwordReset/use-cases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '@application/passwordReset/use-cases/ResetPasswordUseCase';

@injectable()
export class PasswordResetController {
  constructor(
    @inject(RequestPasswordResetUseCase) private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    @inject(ResetPasswordUseCase) private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  requestReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.requestPasswordResetUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.resetPasswordUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
