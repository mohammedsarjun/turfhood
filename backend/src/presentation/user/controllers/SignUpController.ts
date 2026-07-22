import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ISignUpUserUseCase } from '@application/user/use-cases/ISignUpUserUseCase';
import { USER_TOKENS } from '@domain/user/tokens';
import { setOtpSessionCookie } from '@presentation/shared/utils/otpSessionCookie';
import { env } from '@config/env';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class SignUpController {
  constructor(
    @inject(USER_TOKENS.SignUpUserUseCase) private readonly signUpUserUseCase: ISignUpUserUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.signUpUserUseCase.execute(req.body);
      setOtpSessionCookie(res, result.otpSessionToken, env.OTP_SESSION_EXPIRY_SECONDS);
      res
        .status(HttpStatus.CREATED)
        .json({ user: result.user, expiresInSeconds: result.expiresInSeconds });
    } catch (error) {
      next(error);
    }
  };
}
