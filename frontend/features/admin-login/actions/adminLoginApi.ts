import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { AdminLoginRequest, AdminLoginResponse } from '../types';

export async function adminLogin(
  payload: AdminLoginRequest,
): Promise<ApiResponse<AdminLoginResponse>> {
  const response = await axiosInstance.post<AdminLoginResponse>(API_ROUTES.admin.login, payload);
  return response.data;
}
