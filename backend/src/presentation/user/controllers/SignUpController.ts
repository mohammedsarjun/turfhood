import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ISignUpUserUseCase } from '@application/user/use-cases/ISignUpUserUseCase';
import { USER_TOKENS } from '@domain/user/tokens';
import { setOtpSessionCookie } from '@presentation/shared/utils/otpSessionCookie';

@injectable()
export class SignUpController {
  constructor(
    @inject(USER_TOKENS.SignUpUserUseCase) private readonly signUpUserUseCase: ISignUpUserUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.signUpUserUseCase.execute(req.body);
      setOtpSessionCookie(res, result.otpSessionToken, result.expiresInSeconds);
      res.status(201).json({ user: result.user, expiresInSeconds: result.expiresInSeconds });
    } catch (error) {
      next(error);
    }
  };
}
