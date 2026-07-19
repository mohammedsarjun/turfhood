import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { ResetPasswordRequest, ResetPasswordResponse } from '../types';

export async function changePassword(
  payload: ResetPasswordRequest,
): Promise<ApiResponse<ResetPasswordResponse>> {
  const response = await axiosInstance.post<ResetPasswordResponse>(
    API_ROUTES.auth.resetPassword,
    payload,
  );
  return response.data;
}
