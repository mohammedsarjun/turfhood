import type { AdminRevenueReportDTO } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function getAdminRevenue(startDate: string, endDate: string) {
  const response = await axiosInstance.get<AdminRevenueReportDTO>(API_ROUTES.admin.revenue, {
    params: { startDate, endDate },
  });
  return response.data;
}
