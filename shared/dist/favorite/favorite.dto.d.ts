import type { PaginatedResponse } from '../common/pagination.js';
import type { NearbyTurfDTO } from '../home/home.dto.js';
export interface FavoriteIdsResponse {
    turfIds: string[];
}
export type FavoriteTurfListResponse = PaginatedResponse<NearbyTurfDTO>;
