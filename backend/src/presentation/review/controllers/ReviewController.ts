import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { CreateReviewRequest } from '@turfhood/shared';
import type { IManageReviewsUseCase } from '@application/review/use-cases/IManageReviewsUseCase';
import { REVIEW_TOKENS } from '@domain/review/tokens';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { HttpStatus } from '@shared/constants/httpStatus';

const userId = (request: Request) => (request as AuthenticatedRequest).user!.userId;
const pagination = (request: Request) => ({
  page: Math.max(1, Number(request.query.page) || 1),
  limit: Math.min(20, Math.max(1, Number(request.query.limit) || 10)),
});

@injectable()
export class ReviewController {
  constructor(@inject(REVIEW_TOKENS.UseCase) private readonly reviews: IManageReviewsUseCase) {}

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      response
        .status(HttpStatus.CREATED)
        .json(
          await this.reviews.create(
            userId(request),
            String(request.params.bookingId),
            request.body as CreateReviewRequest,
          ),
        );
    } catch (error) {
      next(error);
    }
  };

  mine = async (request: Request, response: Response, next: NextFunction) => {
    try {
      response.json(await this.reviews.getMine(userId(request), String(request.params.bookingId)));
    } catch (error) {
      next(error);
    }
  };

  publicList = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { page, limit } = pagination(request);
      response.json(await this.reviews.listPublic(String(request.params.turfId), page, limit));
    } catch (error) {
      next(error);
    }
  };

  ownerList = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { page, limit } = pagination(request);
      response.json(
        await this.reviews.listForOwner(
          userId(request),
          String(request.params.turfId),
          page,
          limit,
        ),
      );
    } catch (error) {
      next(error);
    }
  };
}
