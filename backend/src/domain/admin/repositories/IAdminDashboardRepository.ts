import type { AdminDashboardDTO, AdminRevenueReportDTO } from '@turfhood/shared';

export interface IAdminDashboardRepository {
  getDashboard(now: Date): Promise<AdminDashboardDTO>;
  getRevenue(startDate: string, endDate: string, now: Date): Promise<AdminRevenueReportDTO>;
}
