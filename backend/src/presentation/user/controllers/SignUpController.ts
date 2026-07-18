import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { SignUpUserUseCase } from '@application/user/use-cases/SignUpUserUseCase';

@injectable()
export class SignUpController {
  constructor(@inject(SignUpUserUseCase) private readonly signUpUserUseCase: SignUpUserUseCase) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.signUpUserUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
