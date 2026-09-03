import type { CreateReviewRequest, ReviewDTO, ReviewListResponse } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function createBookingReview(bookingId: string, input: CreateReviewRequest) {
  const response = await axiosInstance.post<ReviewDTO>(
    API_ROUTES.reviews.forBooking(bookingId),
    input,
  );
  return response.data;
}

export async function getBookingReview(bookingId: string) {
  const response = await axiosInstance.get<ReviewDTO | null>(
    API_ROUTES.reviews.forBooking(bookingId),
  );
  return response.data;
}

export async function listTurfReviews(turfId: string, page = 1) {
  const response = await axiosInstance.get<ReviewListResponse>(API_ROUTES.reviews.forTurf(turfId), {
    params: { page, limit: 10 },
  });
  return response.data;
}

export async function listOwnerReviews(turfId: string, page = 1) {
  const response = await axiosInstance.get<ReviewListResponse>(
    API_ROUTES.reviews.forOwner(turfId),
    {
      params: { page, limit: 20 },
    },
  );
  return response.data;
}
