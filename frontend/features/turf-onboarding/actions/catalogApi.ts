import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { CatalogItem, PaginatedResponse } from '@turfhood/shared';

export async function listPublicSportsTypes(): Promise<
  ApiResponse<PaginatedResponse<CatalogItem>>
> {
  const response = await axiosInstance.get<PaginatedResponse<CatalogItem>>(
    API_ROUTES.sports.public,
  );
  return response.data;
}

export async function listPublicAmenities(): Promise<ApiResponse<PaginatedResponse<CatalogItem>>> {
  const response = await axiosInstance.get<PaginatedResponse<CatalogItem>>(
    API_ROUTES.amenities.public,
  );
  return response.data;
}
