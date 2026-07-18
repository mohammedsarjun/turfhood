import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ILoginUserUseCase } from '@application/user/use-cases/ILoginUserUseCase';
import { USER_TOKENS } from '@domain/user/tokens';

@injectable()
export class LoginController {
  constructor(
    @inject(USER_TOKENS.LoginUserUseCase) private readonly loginUserUseCase: ILoginUserUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUserUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
