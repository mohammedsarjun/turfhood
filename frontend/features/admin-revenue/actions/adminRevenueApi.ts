import type { AdminRevenueReportDTO } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function getAdminRevenue(startDate: string, endDate: string, page = 1) {
  const response = await axiosInstance.get<AdminRevenueReportDTO>(API_ROUTES.admin.revenue, {
    params: { startDate, endDate, page },
  });
  return response.data;
}
