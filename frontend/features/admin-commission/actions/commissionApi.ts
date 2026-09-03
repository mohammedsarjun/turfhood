import type { CommissionSettingDTO, UpdateCommissionRequest } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function getCommissionSetting(): Promise<CommissionSettingDTO> {
  const response = await axiosInstance.get<CommissionSettingDTO>(API_ROUTES.admin.commission);
  return response.data;
}

export async function updateCommissionSetting(
  input: UpdateCommissionRequest,
): Promise<CommissionSettingDTO> {
  const response = await axiosInstance.put<CommissionSettingDTO>(
    API_ROUTES.admin.commission,
    input,
  );
  return response.data;
}
