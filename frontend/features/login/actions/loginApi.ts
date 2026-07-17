import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { LoginRequest, LoginResponse } from '../types';

export async function login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await axiosInstance.post<LoginResponse>(API_ROUTES.auth.login, payload);
  return response.data;
}
