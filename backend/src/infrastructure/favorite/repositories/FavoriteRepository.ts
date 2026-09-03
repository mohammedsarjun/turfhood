import { injectable } from 'tsyringe';
import type { IFavoriteRepository } from '@domain/favorite/repositories/IFavoriteRepository';
import { FavoriteModel } from '../models/FavoriteModel.js';

@injectable()
export class FavoriteRepository implements IFavoriteRepository {
  async add(userId: string, turfId: string) {
    await FavoriteModel.updateOne(
      { userId, turfId },
      { $setOnInsert: { userId, turfId } },
      { upsert: true },
    );
  }

  async remove(userId: string, turfId: string) {
    await FavoriteModel.deleteOne({ userId, turfId });
  }

  async listTurfIds(userId: string) {
    const favorites = await FavoriteModel.find({ userId }).sort({ createdAt: -1 }).select('turfId');
    return favorites.map((favorite) => favorite.turfId.toString());
  }
}
