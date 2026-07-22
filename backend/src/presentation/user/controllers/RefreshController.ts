import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IRefreshAccessTokenUseCase } from '@application/refreshToken/use-cases/IRefreshAccessTokenUseCase';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import { setAuthCookie, setRefreshCookie } from '@presentation/shared/utils/authCookie';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class RefreshController {
  constructor(
    @inject(REFRESH_TOKEN_TOKENS.RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: IRefreshAccessTokenUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
      const rawRefreshToken = cookies?.refreshToken;
      if (!rawRefreshToken) {
        throw new TokenMissingError();
      }

      const result = await this.refreshAccessTokenUseCase.execute(rawRefreshToken);
      setAuthCookie(res, result.accessToken);
      setRefreshCookie(res, result.refreshToken);
      res.status(HttpStatus.OK).json({ accessToken: result.accessToken });
    } catch (error) {
      next(error);
    }
  };
}
