import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { PaginatedResponse, TurfApplicationSummary } from '@turfhood/shared';

export interface ListTurfOwnerApplicationsParams {
  page: number;
  limit: number;
  status?: 'pending' | 'approved' | 'rejected';
}

export async function listTurfOwnerApplications(
  params: ListTurfOwnerApplicationsParams,
): Promise<ApiResponse<PaginatedResponse<TurfApplicationSummary>>> {
  const response = await axiosInstance.get<PaginatedResponse<TurfApplicationSummary>>(
    API_ROUTES.turfOwnerApplications.base,
    { params },
  );
  return response.data;
}

export async function approveTurfOwnerApplication(
  id: string,
): Promise<ApiResponse<{ application: TurfApplicationSummary }>> {
  const response = await axiosInstance.patch<{ application: TurfApplicationSummary }>(
    `${API_ROUTES.turfOwnerApplications.base}/${id}/approve`,
  );
  return response.data;
}

export async function rejectTurfOwnerApplication(
  id: string,
  reviewNotes?: string,
): Promise<ApiResponse<{ application: TurfApplicationSummary }>> {
  const response = await axiosInstance.patch<{ application: TurfApplicationSummary }>(
    `${API_ROUTES.turfOwnerApplications.base}/${id}/reject`,
    { reviewNotes },
  );
  return response.data;
}
