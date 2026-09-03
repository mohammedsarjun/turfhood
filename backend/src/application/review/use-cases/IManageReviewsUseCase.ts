import type { CreateReviewRequest, ReviewDTO, ReviewListResponse } from '@turfhood/shared';

export interface IManageReviewsUseCase {
  create(userId: string, bookingId: string, input: CreateReviewRequest): Promise<ReviewDTO>;
  getMine(userId: string, bookingId: string): Promise<ReviewDTO | null>;
  listPublic(turfId: string, page: number, limit: number): Promise<ReviewListResponse>;
  listForOwner(
    ownerId: string,
    portalTurfId: string,
    page: number,
    limit: number,
  ): Promise<ReviewListResponse>;
}
