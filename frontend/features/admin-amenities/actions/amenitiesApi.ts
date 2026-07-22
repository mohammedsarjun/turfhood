import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { PaginatedResponse } from '@turfhood/shared';
import type { Amenity, UpdateAmenityRequest } from '../types';

export interface ListAmenitiesParams {
  page: number;
  limit: number;
  search?: string;
  isListed?: boolean;
}

export async function listAmenities(
  params: ListAmenitiesParams,
): Promise<ApiResponse<PaginatedResponse<Amenity>>> {
  const response = await axiosInstance.get<PaginatedResponse<Amenity>>(API_ROUTES.amenities.base, {
    params,
  });
  return response.data;
}

export async function createAmenity(
  name: string,
  icon: File,
): Promise<ApiResponse<{ item: Amenity }>> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('icon', icon);
  const response = await axiosInstance.post<{ item: Amenity }>(
    API_ROUTES.amenities.base,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function updateAmenity(
  id: string,
  payload: UpdateAmenityRequest,
): Promise<ApiResponse<{ item: Amenity }>> {
  const response = await axiosInstance.patch<{ item: Amenity }>(
    `${API_ROUTES.amenities.base}/${id}`,
    payload,
  );
  return response.data;
}

export async function toggleAmenityListed(
  id: string,
  isListed: boolean,
): Promise<ApiResponse<{ item: Amenity }>> {
  const response = await axiosInstance.patch<{ item: Amenity }>(
    `${API_ROUTES.amenities.base}/${id}/listed`,
    { isListed },
  );
  return response.data;
}

export async function uploadAmenityIcon(
  id: string,
  file: File,
): Promise<ApiResponse<{ item: Amenity }>> {
  const formData = new FormData();
  formData.append('icon', file);
  const response = await axiosInstance.post<{ item: Amenity }>(
    `${API_ROUTES.amenities.base}/${id}/icon`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}
