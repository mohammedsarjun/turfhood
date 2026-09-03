import type { FavoriteIdsResponse, FavoriteTurfListResponse } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function listFavoriteIds() {
  const response = await axiosInstance.get<FavoriteIdsResponse>(API_ROUTES.favorites.ids);
  return response.data.turfIds;
}

export async function listFavoriteTurfs(page = 1) {
  const response = await axiosInstance.get<FavoriteTurfListResponse>(API_ROUTES.favorites.base, {
    params: { page, limit: 12 },
  });
  return response.data;
}

export async function addFavorite(turfId: string) {
  await axiosInstance.put(API_ROUTES.favorites.turf(turfId));
}

export async function removeFavorite(turfId: string) {
  await axiosInstance.delete(API_ROUTES.favorites.turf(turfId));
}
