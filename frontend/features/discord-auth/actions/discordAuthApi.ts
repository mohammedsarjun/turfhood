import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { DiscordAuthRequest, DiscordAuthResponse } from '@turfhood/shared';

export async function discordAuth(
  payload: DiscordAuthRequest,
): Promise<ApiResponse<DiscordAuthResponse>> {
  const response = await axiosInstance.post<DiscordAuthResponse>(API_ROUTES.auth.discord, payload);
  return response.data;
}
