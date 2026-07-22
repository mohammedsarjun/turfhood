import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ILoginWithGoogleUseCase } from '@application/user/use-cases/ILoginWithGoogleUseCase';
import { USER_TOKENS } from '@domain/user/tokens';
import { setAuthCookie } from '@presentation/shared/utils/authCookie';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class GoogleAuthController {
  constructor(
    @inject(USER_TOKENS.LoginWithGoogleUseCase)
    private readonly loginWithGoogleUseCase: ILoginWithGoogleUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginWithGoogleUseCase.execute(req.body);
      setAuthCookie(res, result.accessToken);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
