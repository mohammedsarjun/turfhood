import type { OpenSessionDTO } from '@turfhood/shared';

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
  list(input: { page: number; limit: number; sportTypeId?: string; coordinates?: { latitude: number; longitude: number } }): Promise<{ items: OpenSessionDTO[]; total: number }>;
  addPendingParticipant(id: string, user: { id: string; name: string }, transactionId: string): Promise<OpenSessionDTO | null>;
  findByTransactionId(transactionId: string): Promise<OpenSessionDTO | null>;
  findPayment(transactionId: string): Promise<{ createdAt: Date; status: string } | null>;
  confirmParticipant(transactionId: string, paymentId: string): Promise<OpenSessionDTO | null>;
  failParticipant(transactionId: string): Promise<void>;
  expireUnfilled(now: Date): Promise<Array<{ sessionId: string; payments: Array<{ userId: string; paymentId: string; amountPaise: number }> }>>;
  markParticipantRefundRequested(sessionId: string, userId: string, requestId: string): Promise<void>;
  listPendingParticipantRefunds(): Promise<Array<{ sessionId: string; userId: string; requestId: string }>>;
  markParticipantRefundResult(sessionId: string, userId: string, status: 'refunded' | 'refund_failed'): Promise<void>;
}
