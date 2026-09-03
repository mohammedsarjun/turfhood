import { inject, injectable } from 'tsyringe';
import type { IFavoriteRepository } from '@domain/favorite/repositories/IFavoriteRepository';
import { FAVORITE_TOKENS } from '@domain/favorite/tokens';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { IListNearbyTurfsUseCase } from '@application/turf/use-cases/IListNearbyTurfsUseCase';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import type { IManageFavoritesUseCase } from './IManageFavoritesUseCase.js';

@injectable()
export class ManageFavoritesUseCase implements IManageFavoritesUseCase {
  constructor(
    @inject(FAVORITE_TOKENS.Repository) private readonly favorites: IFavoriteRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(TURF_TOKENS.ListNearbyTurfsUseCase)
    private readonly turfCards: IListNearbyTurfsUseCase,
  ) {}

  async add(userId: string, turfId: string) {
    if (!(await this.turfs.findApprovedById(turfId)))
      throw new AppError('Turf not found.', HttpStatus.NOT_FOUND, 'TURF_NOT_FOUND');
    await this.favorites.add(userId, turfId);
  }

  async remove(userId: string, turfId: string) {
    await this.favorites.remove(userId, turfId);
  }

  async ids(userId: string) {
    return { turfIds: await this.favorites.listTurfIds(userId) };
  }

  async list(userId: string, page: number, limit: number) {
    const ids = await this.favorites.listTurfIds(userId);
    const availableTurfs = await this.turfCards.byIds(ids);
    const start = (page - 1) * limit;
    return {
      items: availableTurfs.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total: availableTurfs.length,
        totalPages: Math.max(1, Math.ceil(availableTurfs.length / limit)),
      },
    };
  }
}
