import type {
  BookingDTO,
  BookingListResponse,
  CreateReservationRequest,
  CreateReservationResponse,
} from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
export async function createReservation(input: CreateReservationRequest) {
  const response = await axiosInstance.post<CreateReservationResponse>(
    API_ROUTES.bookings.reservations,
    input,
  );
  return response.data;
}
export async function listMyBookings(page = 1) {
  const response = await axiosInstance.get<BookingListResponse>(API_ROUTES.bookings.mine, {
    params: { page, limit: 10 },
  });
  return response.data;
}
export async function getMyBooking(id: string) {
  const response = await axiosInstance.get<BookingDTO>(API_ROUTES.bookings.details(id));
  return response.data;
}
export async function cancelMyBooking(id: string, reason?: string) {
  const response = await axiosInstance.post<BookingDTO>(API_ROUTES.bookings.cancel(id), { reason });
  return response.data;
}
export async function retryBookingPayment(id: string) {
  const response = await axiosInstance.post<CreateReservationResponse>(
    API_ROUTES.bookings.retry(id),
  );
  return response.data;
}
export async function abandonBookingCheckout(id: string) {
  await axiosInstance.post(API_ROUTES.bookings.abandon(id));
}
export async function listOwnerBookings(turfId: string) {
  const response = await axiosInstance.get<BookingListResponse>(API_ROUTES.bookings.owner(turfId));
  return response.data;
}
export async function cancelOwnerBooking(turfId: string, id: string, reason: string) {
  const response = await axiosInstance.post<BookingDTO>(
    API_ROUTES.bookings.ownerCancel(turfId, id),
    { reason },
  );
  return response.data;
}
export function submitPaymentForm(payment: CreateReservationResponse['payment']) {
  if (!payment.action || !/^https:\/\//i.test(payment.action)) {
    throw new Error('PayU payment URL is invalid.');
  }
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payment.action;
  for (const [name, value] of Object.entries(payment.fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
