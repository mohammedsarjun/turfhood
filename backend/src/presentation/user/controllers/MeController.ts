import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IGetCurrentUserUseCase } from '@application/user/use-cases/IGetCurrentUserUseCase';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import { USER_TOKENS } from '@domain/user/tokens';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';

@injectable()
export class MeController {
  constructor(
    @inject(USER_TOKENS.GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: IGetCurrentUserUseCase,
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;
      if (!userId) {
        throw new TokenMissingError();
      }
      const result = await this.getCurrentUserUseCase.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
