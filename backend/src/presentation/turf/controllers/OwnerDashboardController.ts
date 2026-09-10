import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IGetOwnerDashboardUseCase } from '@application/turf/use-cases/IGetOwnerDashboardUseCase';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class OwnerDashboardController {
  constructor(
    @inject(TURF_TOKENS.GetOwnerDashboardUseCase)
    private readonly dashboard: IGetOwnerDashboardUseCase,
  ) {}
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = (req as AuthenticatedRequest).user!.userId;
      res
        .status(HttpStatus.OK)
        .json(await this.dashboard.execute(ownerId, String(req.params.turfId)));
    } catch (error) {
      next(error);
    }
  };
}
