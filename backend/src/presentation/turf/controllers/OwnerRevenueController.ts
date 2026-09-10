import { parsePagination } from '@presentation/shared/utils/pagination';
import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IGetOwnerRevenueUseCase } from '@application/turf/use-cases/IGetOwnerRevenueUseCase';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
@injectable()
export class OwnerRevenueController {
  constructor(
    @inject(TURF_TOKENS.GetOwnerRevenueUseCase) private readonly revenue: IGetOwnerRevenueUseCase,
  ) {}
  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = (req as AuthenticatedRequest).user!.userId;
      res.json(
        await this.revenue.execute(
          ownerId,
          String(req.params.turfId),
          String(req.query.startDate ?? ''),
          String(req.query.endDate ?? ''),
          req.query.page === undefined ? undefined : parsePagination(req.query).page,
        ),
      );
    } catch (error) {
      next(error);
    }
  };
}
