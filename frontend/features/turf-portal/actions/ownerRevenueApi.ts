import type { TurfRevenueReportDTO } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
export async function getOwnerRevenue(
  turfId: string,
  startDate: string,
  endDate: string,
  page?: number,
) {
  const response = await axiosInstance.get<TurfRevenueReportDTO>(API_ROUTES.turfRevenue(turfId), {
    params: { startDate, endDate, page },
  });
  return response.data;
}
