import type {
  CreateOpenSessionRequest,
  OpenSessionDTO,
  OpenSessionListResponse,
  OpenSessionPaymentResponse,
} from '@turfhood/shared';
import type { PaymentCallback } from '@domain/booking/services/IPaymentService';

export interface IManageOpenSessionsUseCase {
  create(userId: string, input: CreateOpenSessionRequest): Promise<OpenSessionPaymentResponse>;
  join(userId: string, sessionId: string): Promise<OpenSessionPaymentResponse>;
  list(input: {
    page: number;
    limit: number;
    sportTypeId?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<OpenSessionListResponse>;
  listMine(userId: string, page: number, limit: number): Promise<OpenSessionListResponse>;
  details(sessionId: string): Promise<OpenSessionDTO>;
  paymentCallback(input: PaymentCallback): Promise<OpenSessionDTO>;
  expireUnfilled(): Promise<number>;
}
