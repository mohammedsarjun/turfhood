import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IAdminLoginUseCase } from '@application/admin/use-cases/IAdminLoginUseCase';
import type { IGetCurrentUserUseCase } from '@application/user/use-cases/IGetCurrentUserUseCase';
import type { IRefreshAccessTokenUseCase } from '@application/refreshToken/use-cases/IRefreshAccessTokenUseCase';
import type { IRevokeRefreshTokenUseCase } from '@application/refreshToken/use-cases/IRevokeRefreshTokenUseCase';
import { ADMIN_TOKENS } from '@domain/admin/tokens';
import { AdminAccessRequiredError } from '@domain/admin/errors/AdminAccessRequiredError';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import { USER_TOKENS } from '@domain/user/tokens';
import {
  clearAdminAuthCookie,
  clearAdminRefreshCookie,
  setAdminAuthCookie,
  setAdminRefreshCookie,
} from '@presentation/admin/utils/adminAuthCookie';
import { HttpStatus } from '@shared/constants/httpStatus';

import type { AdminAuthenticatedRequest } from '../middlewares/adminOnly.js';

@injectable()
export class AdminAuthController {
  constructor(
    @inject(ADMIN_TOKENS.AdminLoginUseCase)
    private readonly adminLoginUseCase: IAdminLoginUseCase,
    @inject(USER_TOKENS.GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: IGetCurrentUserUseCase,
    @inject(REFRESH_TOKEN_TOKENS.RevokeRefreshTokenUseCase)
    private readonly revokeRefreshTokenUseCase: IRevokeRefreshTokenUseCase,
    @inject(REFRESH_TOKEN_TOKENS.RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: IRefreshAccessTokenUseCase,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminLoginUseCase.execute(req.body);
      setAdminAuthCookie(res, result.accessToken);
      setAdminRefreshCookie(res, result.refreshToken);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    await this.revokeRefreshTokenUseCase.execute(cookies?.adminRefreshToken);
    clearAdminAuthCookie(res);
    clearAdminRefreshCookie(res);
    res.status(HttpStatus.OK).json({ message: 'Logged out successfully.' });
  };

  /**
   * The refresh token itself doesn't carry an "admin session" flag — it's the same store used
   * by regular users. So after rotating, this checks the *current* roles the use case resolved
   * (not the possibly-stale claim on the old token) before trusting the result with an admin
   * cookie; a non-admin's refresh token gets a valid rotated token back, just never the admin one.
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
      const rawRefreshToken = cookies?.adminRefreshToken;
      if (!rawRefreshToken) {
        throw new TokenMissingError();
      }

      const result = await this.refreshAccessTokenUseCase.execute(rawRefreshToken);
      if (!result.roles.includes('admin')) {
        throw new AdminAccessRequiredError();
      }

      setAdminAuthCookie(res, result.accessToken);
      setAdminRefreshCookie(res, result.refreshToken);
      res.status(HttpStatus.OK).json({ accessToken: result.accessToken });
    } catch (error) {
      clearAdminAuthCookie(res);
      clearAdminRefreshCookie(res);
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as AdminAuthenticatedRequest).admin?.userId;
      if (!adminId) {
        throw new TokenMissingError();
      }
      const result = await this.getCurrentUserUseCase.execute(adminId);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
