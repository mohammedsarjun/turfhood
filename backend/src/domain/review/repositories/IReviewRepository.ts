import type { ReviewDTO } from '@turfhood/shared';

export interface CreateReviewPersistenceInput {
  bookingId: string;
  userId: string;
  turfId: string;
  courtId: string;
  customerName: string;
  turfName: string;
  courtName: string;
  rating: number;
  comment: string;
}

export interface IReviewRepository {
  create(input: CreateReviewPersistenceInput): Promise<ReviewDTO>;
  findByBookingId(bookingId: string): Promise<ReviewDTO | null>;
  listByTurf(
    turfId: string,
    page: number,
    limit: number,
  ): Promise<{
    items: ReviewDTO[];
    total: number;
    average: number;
  }>;
}
