import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IGetAdminDashboardUseCase } from '@application/admin/use-cases/IGetAdminDashboardUseCase';
import type { IGetAdminRevenueUseCase } from '@application/admin/use-cases/IGetAdminRevenueUseCase';
import { ADMIN_TOKENS } from '@domain/admin/tokens';

@injectable()
export class AdminDashboardController {
  constructor(
    @inject(ADMIN_TOKENS.DashboardUseCase)
    private readonly dashboard: IGetAdminDashboardUseCase,
    @inject(ADMIN_TOKENS.RevenueUseCase) private readonly revenue: IGetAdminRevenueUseCase,
  ) {}

  get = async (_request: Request, response: Response, next: NextFunction) => {
    try {
      response.json(await this.dashboard.execute());
    } catch (error) {
      next(error);
    }
  };
  getRevenue = async (request: Request, response: Response, next: NextFunction) => {
    try {
      response.json(
        await this.revenue.execute(
          String(request.query.startDate ?? ''),
          String(request.query.endDate ?? ''),
        ),
      );
    } catch (error) {
      next(error);
    }
  };
}
