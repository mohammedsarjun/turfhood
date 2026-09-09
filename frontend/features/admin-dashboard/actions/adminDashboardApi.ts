import type { AdminDashboardDTO } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function getAdminDashboard() {
  const response = await axiosInstance.get<AdminDashboardDTO>(API_ROUTES.admin.dashboard);
  return response.data;
}
