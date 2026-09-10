import type { AdminDashboardDTO } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function getAdminDashboard(page = 1) {
  const response = await axiosInstance.get<AdminDashboardDTO>(API_ROUTES.admin.dashboard, {
    params: { page },
  });
  return response.data;
}
