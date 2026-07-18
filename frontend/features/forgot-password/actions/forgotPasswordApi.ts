import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { ForgotPasswordRequest, ForgotPasswordResponse } from '../types';

export async function requestPasswordReset(
  payload: ForgotPasswordRequest,
): Promise<ApiResponse<ForgotPasswordResponse>> {
  const response = await axiosInstance.post<ForgotPasswordResponse>(
    API_ROUTES.auth.forgotPasswordRequest,
    payload,
  );
  return response.data;
}
