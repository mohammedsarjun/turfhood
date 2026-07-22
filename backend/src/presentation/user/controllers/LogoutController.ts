import type { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IRevokeRefreshTokenUseCase } from '@application/refreshToken/use-cases/IRevokeRefreshTokenUseCase';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';
import { clearAuthCookie, clearRefreshCookie } from '@presentation/shared/utils/authCookie';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class LogoutController {
  constructor(
    @inject(REFRESH_TOKEN_TOKENS.RevokeRefreshTokenUseCase)
    private readonly revokeRefreshTokenUseCase: IRevokeRefreshTokenUseCase,
  ) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    await this.revokeRefreshTokenUseCase.execute(cookies?.refreshToken);
    clearAuthCookie(res);
    clearRefreshCookie(res);
    res.status(HttpStatus.OK).json({ message: 'Logged out successfully.' });
  };
}
