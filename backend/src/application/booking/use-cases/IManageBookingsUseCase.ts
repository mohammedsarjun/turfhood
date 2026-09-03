import type {
  BookingDTO,
  BookingListResponse,
  CreateReservationRequest,
  CreateReservationResponse,
} from '@turfhood/shared';
import type { PaymentCallback } from '@domain/booking/services/IPaymentService';
export interface IManageBookingsUseCase {
  reserve(userId: string, input: CreateReservationRequest): Promise<CreateReservationResponse>;
  paymentCallback(input: PaymentCallback): Promise<BookingDTO>;
  reconcileRefunds(limit?: number): Promise<number>;
  listMine(userId: string, page: number, limit: number): Promise<BookingListResponse>;
  getMine(userId: string, bookingId: string): Promise<BookingDTO>;
  retryPayment(userId: string, bookingId: string): Promise<CreateReservationResponse>;
  cancelMine(userId: string, bookingId: string, reason?: string): Promise<BookingDTO>;
  listForOwner(
    ownerId: string,
    portalTurfId: string,
    page: number,
    limit: number,
  ): Promise<BookingListResponse>;
  cancelForOwner(
    ownerId: string,
    portalTurfId: string,
    bookingId: string,
    reason?: string,
  ): Promise<BookingDTO>;
}
