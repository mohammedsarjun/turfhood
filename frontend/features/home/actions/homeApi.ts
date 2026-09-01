import type {
  BannerDTO,
  NearbyTurfDTO,
  PaginatedResponse,
  TurfDetailResponse,
  TurfDiscoveryFilters,
} from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function listBanners(): Promise<BannerDTO[]> {
  const response = await axiosInstance.get<{ items: BannerDTO[] }>(API_ROUTES.banners.base);
  return response.data.items;
}

export async function discoverTurfs(
  filters: TurfDiscoveryFilters,
): Promise<PaginatedResponse<NearbyTurfDTO>> {
  const response = await axiosInstance.get<PaginatedResponse<NearbyTurfDTO>>(
    API_ROUTES.turfs.discover,
    {
      params: { ...filters, amenityIds: filters.amenityIds?.join(',') },
    },
  );
  return response.data;
}

export async function getPublicTurfDetails(
  turfId: string,
  page: number,
): Promise<TurfDetailResponse> {
  const response = await axiosInstance.get<TurfDetailResponse>(API_ROUTES.turfs.details(turfId), {
    params: { page, limit: 6 },
  });
  return response.data;
}

export async function listNearbyTurfs(
  location: { cityCode: string; cityName: string; stateCode: string; stateName: string },
  limit = 4,
): Promise<NearbyTurfDTO[]> {
  const response = await axiosInstance.get<{ items: NearbyTurfDTO[] }>(API_ROUTES.turfs.nearby, {
    params: { ...location, limit },
  });
  return response.data.items;
}
