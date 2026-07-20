import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function adminLogout(): Promise<void> {
  await axiosInstance.post(API_ROUTES.admin.logout);
}
