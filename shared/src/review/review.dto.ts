import type { PaginatedResponse } from '../common/pagination.js';

export interface ReviewDTO {
  id: string;
  bookingId: string;
  userId: string;
  turfId: string;
  courtId: string;
  customerName: string;
  turfName: string;
  courtName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewSummaryDTO {
  average: number;
  count: number;
}

export interface ReviewListResponse extends PaginatedResponse<ReviewDTO> {
  summary: ReviewSummaryDTO;
}
