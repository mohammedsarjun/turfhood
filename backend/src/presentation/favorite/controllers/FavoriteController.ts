import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IManageFavoritesUseCase } from '@application/favorite/use-cases/IManageFavoritesUseCase';
import { FAVORITE_TOKENS } from '@domain/favorite/tokens';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { HttpStatus } from '@shared/constants/httpStatus';

const userId = (request: Request) => (request as AuthenticatedRequest).user!.userId;

@injectable()
export class FavoriteController {
  constructor(
    @inject(FAVORITE_TOKENS.UseCase) private readonly favorites: IManageFavoritesUseCase,
  ) {}

  add = async (request: Request, response: Response, next: NextFunction) => {
    try {
      await this.favorites.add(userId(request), String(request.params.turfId));
      response.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  remove = async (request: Request, response: Response, next: NextFunction) => {
    try {
      await this.favorites.remove(userId(request), String(request.params.turfId));
      response.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  ids = async (request: Request, response: Response, next: NextFunction) => {
    try {
      response.json(await this.favorites.ids(userId(request)));
    } catch (error) {
      next(error);
    }
  };

  list = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(request.query.page) || 1);
      const limit = Math.min(20, Math.max(1, Number(request.query.limit) || 12));
      response.json(await this.favorites.list(userId(request), page, limit));
    } catch (error) {
      next(error);
    }
  };
}
