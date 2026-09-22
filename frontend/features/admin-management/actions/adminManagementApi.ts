import type {
  AdminTurfListResponse,
  AdminTurfSummaryDTO,
  AdminUserListResponse,
  AdminUserSummaryDTO,
} from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export interface AdminManagementListParams {
  page: number;
  limit: number;
  search?: string;
}

export async function listAdminUsers(
  params: AdminManagementListParams,
): Promise<AdminUserListResponse> {
  const response = await axiosInstance.get<AdminUserListResponse>(API_ROUTES.admin.users, {
    params,
  });
  return response.data;
}

export async function suspendAdminUser(id: string, reason: string): Promise<AdminUserSummaryDTO> {
  const response = await axiosInstance.post<{ user: AdminUserSummaryDTO }>(
    API_ROUTES.admin.suspendUser(id),
    { reason },
  );
  return response.data.user;
}

export async function unsuspendAdminUser(id: string): Promise<AdminUserSummaryDTO> {
  const response = await axiosInstance.post<{ user: AdminUserSummaryDTO }>(
    API_ROUTES.admin.unsuspendUser(id),
  );
  return response.data.user;
}

export async function listAdminTurfs(
  params: AdminManagementListParams,
): Promise<AdminTurfListResponse> {
  const response = await axiosInstance.get<AdminTurfListResponse>(API_ROUTES.admin.turfs, {
    params,
  });
  return response.data;
}

export async function suspendAdminTurf(id: string, reason: string): Promise<AdminTurfSummaryDTO> {
  const response = await axiosInstance.post<{ turf: AdminTurfSummaryDTO }>(
    API_ROUTES.admin.suspendTurf(id),
    { reason },
  );
  return response.data.turf;
}

export async function unsuspendAdminTurf(id: string): Promise<AdminTurfSummaryDTO> {
  const response = await axiosInstance.post<{ turf: AdminTurfSummaryDTO }>(
    API_ROUTES.admin.unsuspendTurf(id),
  );
  return response.data.turf;
}
