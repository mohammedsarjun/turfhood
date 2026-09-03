import type { BookingDTO, BookingListResponse } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function listEscalatedRefunds() {
  const response = await axiosInstance.get<BookingListResponse>(API_ROUTES.admin.escalatedRefunds);
  return response.data;
}

export async function verifyManualRefund(bookingId: string, payuRequestId: string) {
  const response = await axiosInstance.post<BookingDTO>(API_ROUTES.admin.verifyRefund(bookingId), {
    payuRequestId,
  });
  return response.data;
}
