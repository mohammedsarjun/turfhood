import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ISignUpUserUseCase } from '@application/user/use-cases/ISignUpUserUseCase';
import { USER_TOKENS } from '@domain/user/tokens';

@injectable()
export class SignUpController {
  constructor(
    @inject(USER_TOKENS.SignUpUserUseCase) private readonly signUpUserUseCase: ISignUpUserUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.signUpUserUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
