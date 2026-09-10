import type { TurfDashboardDTO } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function getOwnerDashboard(turfId: string): Promise<TurfDashboardDTO> {
  const response = await axiosInstance.get<TurfDashboardDTO>(API_ROUTES.turfDashboard(turfId));
  return response.data;
}
