import type { FavoriteIdsResponse, FavoriteTurfListResponse } from '@turfhood/shared';

export interface IManageFavoritesUseCase {
  add(userId: string, turfId: string): Promise<void>;
  remove(userId: string, turfId: string): Promise<void>;
  ids(userId: string): Promise<FavoriteIdsResponse>;
  list(userId: string, page: number, limit: number): Promise<FavoriteTurfListResponse>;
}
