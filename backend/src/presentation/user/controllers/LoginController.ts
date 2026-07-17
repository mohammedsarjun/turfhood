import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { LoginUserUseCase } from '@application/user/use-cases/LoginUserUseCase';

@injectable()
export class LoginController {
  constructor(@inject(LoginUserUseCase) private readonly loginUserUseCase: LoginUserUseCase) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUserUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
