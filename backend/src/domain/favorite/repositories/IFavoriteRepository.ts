export interface IFavoriteRepository {
  add(userId: string, turfId: string): Promise<void>;
  remove(userId: string, turfId: string): Promise<void>;
  listTurfIds(userId: string): Promise<string[]>;
}
