import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function refreshSession(): Promise<void> {
  await axiosInstance.post(API_ROUTES.users.refresh);
}

export async function refreshAdminSession(): Promise<void> {
  await axiosInstance.post(API_ROUTES.admin.refresh);
}
