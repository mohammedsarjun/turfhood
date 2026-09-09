import type { TurfRevenueReportDTO } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
export async function getOwnerRevenue(turfId: string, startDate: string, endDate: string) {
  const response = await axiosInstance.get<TurfRevenueReportDTO>(API_ROUTES.turfRevenue(turfId), { params: { startDate, endDate } });
  return response.data;
}
