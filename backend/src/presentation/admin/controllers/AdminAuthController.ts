import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IAdminLoginUseCase } from '@application/admin/use-cases/IAdminLoginUseCase';
import type { IGetCurrentUserUseCase } from '@application/user/use-cases/IGetCurrentUserUseCase';
import { ADMIN_TOKENS } from '@domain/admin/tokens';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import { USER_TOKENS } from '@domain/user/tokens';
import {
  clearAdminAuthCookie,
  setAdminAuthCookie,
} from '@presentation/admin/utils/adminAuthCookie';

import type { AdminAuthenticatedRequest } from '../middlewares/adminOnly.js';

@injectable()
export class AdminAuthController {
  constructor(
    @inject(ADMIN_TOKENS.AdminLoginUseCase)
    private readonly adminLoginUseCase: IAdminLoginUseCase,
    @inject(USER_TOKENS.GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: IGetCurrentUserUseCase,
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminLoginUseCase.execute(req.body);
      setAdminAuthCookie(res, result.accessToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response): void => {
    clearAdminAuthCookie(res);
    res.status(200).json({ message: 'Logged out successfully.' });
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as AdminAuthenticatedRequest).admin?.userId;
      if (!adminId) {
        throw new TokenMissingError();
      }
      const result = await this.getCurrentUserUseCase.execute(adminId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
