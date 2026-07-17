import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { SignUpRequest, SignUpResponse } from '../types';

export async function signUp(payload: SignUpRequest): Promise<ApiResponse<SignUpResponse>> {
  const response = await axiosInstance.post<SignUpResponse>(API_ROUTES.auth.signUp, payload);
  return response.data;
}
