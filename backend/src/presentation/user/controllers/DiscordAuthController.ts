import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ILoginWithDiscordUseCase } from '@application/user/use-cases/ILoginWithDiscordUseCase';
import { USER_TOKENS } from '@domain/user/tokens';
import { setAuthCookie, setRefreshCookie } from '@presentation/shared/utils/authCookie';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class DiscordAuthController {
  constructor(
    @inject(USER_TOKENS.LoginWithDiscordUseCase)
    private readonly loginWithDiscordUseCase: ILoginWithDiscordUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginWithDiscordUseCase.execute(req.body);
      setAuthCookie(res, result.accessToken);
      setRefreshCookie(res, result.refreshToken);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
