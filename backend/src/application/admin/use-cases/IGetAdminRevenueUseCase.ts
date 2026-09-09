import type { AdminRevenueReportDTO } from '@turfhood/shared';

export interface IGetAdminRevenueUseCase {
  execute(startDate: string, endDate: string): Promise<AdminRevenueReportDTO>;
}
