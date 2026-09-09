import { inject, injectable } from 'tsyringe';
import type { AdminRevenueReportDTO } from '@turfhood/shared';
import type { IAdminDashboardRepository } from '@domain/admin/repositories/IAdminDashboardRepository';
import { ADMIN_TOKENS } from '@domain/admin/tokens';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import type { IGetAdminRevenueUseCase } from './IGetAdminRevenueUseCase.js';

@injectable()
export class GetAdminRevenueUseCase implements IGetAdminRevenueUseCase {
  constructor(
    @inject(ADMIN_TOKENS.DashboardRepository) private readonly reports: IAdminDashboardRepository,
  ) {}
  execute(startDate: string, endDate: string): Promise<AdminRevenueReportDTO> {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
      startDate > endDate
    )
      throw new AppError('Choose a valid revenue date range.', HttpStatus.BAD_REQUEST);
    return this.reports.getRevenue(startDate, endDate, new Date());
  }
}
