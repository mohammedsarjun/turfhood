import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { PaginatedResponse } from '@turfhood/shared';
import type { SportsType, UpdateSportsTypeRequest } from '../types';

export interface ListSportsTypesParams {
  page: number;
  limit: number;
  search?: string;
  isListed?: boolean;
}

export async function listSportsTypes(
  params: ListSportsTypesParams,
): Promise<ApiResponse<PaginatedResponse<SportsType>>> {
  const response = await axiosInstance.get<PaginatedResponse<SportsType>>(API_ROUTES.sports.base, {
    params,
  });
  return response.data;
}

export async function createSportsType(
  name: string,
  icon: File,
): Promise<ApiResponse<{ item: SportsType }>> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('icon', icon);
  const response = await axiosInstance.post<{ item: SportsType }>(
    API_ROUTES.sports.base,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function updateSportsType(
  id: string,
  payload: UpdateSportsTypeRequest,
): Promise<ApiResponse<{ item: SportsType }>> {
  const response = await axiosInstance.patch<{ item: SportsType }>(
    `${API_ROUTES.sports.base}/${id}`,
    payload,
  );
  return response.data;
}

export async function toggleSportsTypeListed(
  id: string,
  isListed: boolean,
): Promise<ApiResponse<{ item: SportsType }>> {
  const response = await axiosInstance.patch<{ item: SportsType }>(
    `${API_ROUTES.sports.base}/${id}/listed`,
    { isListed },
  );
  return response.data;
}

export async function uploadSportsTypeIcon(
  id: string,
  file: File,
): Promise<ApiResponse<{ item: SportsType }>> {
  const formData = new FormData();
  formData.append('icon', file);
  const response = await axiosInstance.post<{ item: SportsType }>(
    `${API_ROUTES.sports.base}/${id}/icon`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}
