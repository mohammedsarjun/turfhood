import type { BannerDTO } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function listAdminBanners(): Promise<BannerDTO[]> {
  const response = await axiosInstance.get<{ items: BannerDTO[] }>(API_ROUTES.banners.base);
  return response.data.items;
}

export async function createBanner(
  title: string,
  description: string,
  image: File,
): Promise<BannerDTO> {
  const data = new FormData();
  data.append('title', title);
  data.append('description', description);
  data.append('image', image);
  const response = await axiosInstance.post<{ item: BannerDTO }>(API_ROUTES.banners.base, data);
  return response.data.item;
}

export async function deleteBanner(id: string): Promise<void> {
  await axiosInstance.delete(`${API_ROUTES.banners.base}/${id}`);
}
