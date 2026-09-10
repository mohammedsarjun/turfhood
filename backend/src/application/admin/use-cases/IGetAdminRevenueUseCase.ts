import type { AdminRevenueReportDTO } from '@turfhood/shared';

export interface IGetAdminRevenueUseCase {
  execute(
    startDate: string,
    endDate: string,
    page?: number,
    limit?: number,
  ): Promise<AdminRevenueReportDTO>;
}
