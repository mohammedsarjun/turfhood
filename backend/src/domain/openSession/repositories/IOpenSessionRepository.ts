import type { CustomerRefundDTO, OpenSessionDTO } from '@turfhood/shared';

export interface CreateOpenSessionPersistenceInput {
  creatorId: string;
  turfId: string;
  courtId: string;
  turfName: string;
  courtName: string;
  courtImage?: string;
  address: string;
  location: { latitude: number; longitude: number };
  sportTypeId: string;
  sportName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  minimumPlayers: number;
  maximumPlayers: number;
  totalPricePaise: number;
  pricePerParticipantPaise: number;
  fillDeadline: Date;
  creator: { name: string; transactionId: string };
}

export interface IOpenSessionRepository {
  create(input: CreateOpenSessionPersistenceInput): Promise<OpenSessionDTO>;
  findById(id: string): Promise<OpenSessionDTO | null>;
  list(input: {
    page: number;
    limit: number;
    sportTypeId?: string;
    coordinates?: { latitude: number; longitude: number };
  }): Promise<{ items: OpenSessionDTO[]; total: number }>;
  listByParticipant(
    userId: string,
    page: number,
    limit: number,
    statuses?: string[],
  ): Promise<{ items: OpenSessionDTO[]; total: number }>;
  listByTurf(
    turfId: string,
    page: number,
    limit: number,
    statuses?: string[],
  ): Promise<{ items: OpenSessionDTO[]; total: number }>;
  addPendingParticipant(
    id: string,
    user: { id: string; name: string },
    transactionId: string,
  ): Promise<OpenSessionDTO | null>;
  findByTransactionId(transactionId: string): Promise<OpenSessionDTO | null>;
  findPayment(transactionId: string): Promise<{ createdAt: Date; status: string } | null>;
  confirmParticipant(transactionId: string, paymentId: string): Promise<OpenSessionDTO | null>;
  listFullDue(now: Date): Promise<OpenSessionDTO[]>;
  markConfirmed(sessionId: string): Promise<void>;
  beginParticipantCancellation(
    sessionId: string,
    userId: string,
    now: Date,
  ): Promise<{ paymentId: string; amountPaise: number } | null>;
  failParticipant(transactionId: string): Promise<void>;
  expirePendingParticipants(now: Date): Promise<number>;
  expireUnfilled(now: Date): Promise<
    Array<{
      sessionId: string;
      payments: Array<{ userId: string; paymentId: string; amountPaise: number }>;
    }>
  >;
  markParticipantRefundRequested(
    sessionId: string,
    userId: string,
    requestId: string,
  ): Promise<void>;
  listPendingParticipantRefunds(): Promise<
    Array<{
      sessionId: string;
      userId: string;
      paymentId: string;
      amountPaise: number;
      attemptCount: number;
      requestToken?: string;
      requestId?: string;
    }>
  >;
  recordParticipantRefundAttempt(
    sessionId: string,
    userId: string,
    requestToken: string,
    maxAttempts: number,
  ): Promise<boolean>;
  recordParticipantRefundFailure(
    sessionId: string,
    userId: string,
    reason: string,
    terminal: boolean,
    rotateToken: boolean,
  ): Promise<void>;
  markParticipantRefundResult(
    sessionId: string,
    userId: string,
    status: 'refunded' | 'refund_failed',
    reason?: string,
  ): Promise<void>;
  listRefundsByUser(userId: string): Promise<CustomerRefundDTO[]>;
}
