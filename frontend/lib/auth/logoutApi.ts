import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function logout(): Promise<void> {
  await axiosInstance.post(API_ROUTES.users.logout);
}
