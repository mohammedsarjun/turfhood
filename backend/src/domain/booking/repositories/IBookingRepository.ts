import type { BookingDTO } from '@turfhood/shared';
export interface CreateBookingPersistenceInput extends Omit<
  BookingDTO,
  'id' | 'createdAt' | 'commissionPercentage' | 'reservationExpiresAt'
> {
  commissionBasisPoints: number;
  reservationExpiresAt: Date;
  payuTransactionId: string;
}
export interface IBookingRepository {
  reserve(input: CreateBookingPersistenceInput): Promise<BookingDTO>;
  findById(id: string): Promise<BookingDTO | null>;
  findByTransactionId(transactionId: string): Promise<BookingDTO | null>;
  listByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: BookingDTO[]; total: number }>;
  listByTurf(
    turfId: string,
    page: number,
    limit: number,
  ): Promise<{ items: BookingDTO[]; total: number }>;
  occupiedStarts(courtId: string, dates: string[], now: Date): Promise<Map<string, Set<string>>>;
  expirePending(now: Date): Promise<number>;
  completePast(now: Date): Promise<number>;
  confirm(
    id: string,
    paymentId: string,
  ): Promise<{ booking: BookingDTO; newlyConfirmed: boolean } | null>;
  fail(id: string): Promise<void>;
  markLatePaymentForRefund(id: string, paymentId: string): Promise<BookingDTO | null>;
  cancel(
    id: string,
    actor: 'customer' | 'owner',
    reason: string | undefined,
    refundPaise: number,
    refundRequestToken?: string,
  ): Promise<BookingDTO | null>;
  markRefundRequested(id: string, payuRequestId: string): Promise<BookingDTO | null>;
  listPendingRefunds(limit: number): Promise<BookingDTO[]>;
  prepareRefund(id: string, requestToken: string): Promise<BookingDTO | null>;
  markRefundChecked(id: string, failureReason?: string): Promise<void>;
  markRefundFailed(id: string, reason: string): Promise<BookingDTO | null>;
  markRefundCompleted(id: string): Promise<BookingDTO | null>;
}
