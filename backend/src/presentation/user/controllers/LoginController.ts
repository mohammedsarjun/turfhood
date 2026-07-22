import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ILoginUserUseCase } from '@application/user/use-cases/ILoginUserUseCase';
import { USER_TOKENS } from '@domain/user/tokens';
import { setAuthCookie, setRefreshCookie } from '@presentation/shared/utils/authCookie';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class LoginController {
  constructor(
    @inject(USER_TOKENS.LoginUserUseCase) private readonly loginUserUseCase: ILoginUserUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUserUseCase.execute(req.body);
      if (result.status === 'success') {
        setAuthCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);
      }
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
