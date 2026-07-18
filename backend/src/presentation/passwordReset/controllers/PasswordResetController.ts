import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IRequestPasswordResetUseCase } from '@application/passwordReset/use-cases/IRequestPasswordResetUseCase';
import type { IResetPasswordUseCase } from '@application/passwordReset/use-cases/IResetPasswordUseCase';
import { PASSWORD_RESET_TOKENS } from '@domain/passwordReset/tokens';

@injectable()
export class PasswordResetController {
  constructor(
    @inject(PASSWORD_RESET_TOKENS.RequestPasswordResetUseCase)
    private readonly requestPasswordResetUseCase: IRequestPasswordResetUseCase,
    @inject(PASSWORD_RESET_TOKENS.ResetPasswordUseCase)
    private readonly resetPasswordUseCase: IResetPasswordUseCase,
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
