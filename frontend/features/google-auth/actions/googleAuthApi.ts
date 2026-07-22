import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { GoogleAuthRequest, GoogleAuthResponse } from '@turfhood/shared';

export async function googleAuth(
  payload: GoogleAuthRequest,
): Promise<ApiResponse<GoogleAuthResponse>> {
  const response = await axiosInstance.post<GoogleAuthResponse>(API_ROUTES.auth.google, payload);
  return response.data;
}
