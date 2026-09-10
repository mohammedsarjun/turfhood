import type { BookingDTO, BookingTimelineEventDTO, CustomerRefundDTO } from '@turfhood/shared';
export interface CreateBookingPersistenceInput extends Omit<
  BookingDTO,
  'id' | 'createdAt' | 'commissionPercentage' | 'reservationExpiresAt'
> {
  commissionBasisPoints: number;
  reservationExpiresAt: Date;
  payuTransactionId: string;
}
export interface IBookingRepository {
  ensureOpenSessionBooking(input: {
    openSessionId: string;
    customerId: string;
    participantUserIds: string[];
    turfId: string;
    courtId: string;
    turfName: string;
    courtName: string;
    address: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    grossAmountPaise: number;
    commissionBasisPoints: number;
    customerSharePaise: number;
    customerName: string;
    customerEmail: string;
  }): Promise<BookingDTO>;
  revenueBetween(
    turfId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    items: BookingDTO[];
    summary: {
      bookings: number;
      grossRevenuePaise: number;
      commissionPaise: number;
      netEarningsPaise: number;
    };
  }>;
  statusCountsBetween(
    turfId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    booked: number;
    cancelled: number;
    completed: number;
  }>;
  reserve(input: CreateBookingPersistenceInput): Promise<BookingDTO>;
  findById(id: string): Promise<BookingDTO | null>;
  findByTransactionId(transactionId: string): Promise<BookingDTO | null>;
  listByUser(
    userId: string,
    page: number,
    limit: number,
    statuses?: string[],
  ): Promise<{ items: BookingDTO[]; total: number }>;
  listByTurf(
    turfId: string,
    page: number,
    limit: number,
  ): Promise<{ items: BookingDTO[]; total: number }>;
  occupiedStarts(
    courtId: string,
    dates: string[],
    now: Date,
  ): Promise<Map<string, Map<string, 'held' | 'confirmed'>>>;
  expirePending(now: Date): Promise<number>;
  completePast(now: Date): Promise<number>;
  confirm(
    id: string,
    paymentId: string,
  ): Promise<{ booking: BookingDTO; newlyConfirmed: boolean } | null>;
  fail(id: string): Promise<void>;
  abandonPending(id: string, userId: string): Promise<void>;
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
  recordRefundAttempt(id: string): Promise<BookingDTO | null>;
  recordRefundFailure(id: string, reason: string, maxAttempts: number): Promise<BookingDTO | null>;
  listEscalatedRefunds(
    page: number,
    limit: number,
  ): Promise<{ items: BookingDTO[]; total: number }>;
  markManualRefundPending(id: string, requestId: string): Promise<BookingDTO | null>;
  listRefundsByUser(userId: string): Promise<CustomerRefundDTO[]>;
  appendTimeline(id: string, event: Omit<BookingTimelineEventDTO, 'occurredAt'>): Promise<void>;
}
