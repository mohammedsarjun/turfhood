import type { BookingDTO } from '@turfhood/shared';
export interface PaymentForm {
  action: string;
  fields: Record<string, string>;
}
export interface OpenSessionPaymentInput {
  transactionId: string;
  sessionId: string;
  amountPaise: number;
  customerName: string;
  customerEmail: string;
  description: string;
}
export interface RefundRequestResult {
  requestId: string;
}
export interface RefundStatusResult {
  status: 'pending' | 'success' | 'failed';
  providerStatus: string;
  requestId?: string;
  reason?: string;
  errorCode?: string;
  retryable?: boolean;
}

export class RefundProviderError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly errorCode?: string,
    public readonly requestMayExist = false,
  ) {
    super(message);
    this.name = 'RefundProviderError';
  }
}
export interface PaymentCallback {
  txnid: string;
  mihpayid?: string;
  status: string;
  amount: string;
  hash: string;
  firstname: string;
  email: string;
  productinfo: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}
export interface IPaymentService {
  createForm(booking: BookingDTO, transactionId: string): PaymentForm;
  createOpenSessionForm(input: OpenSessionPaymentInput): PaymentForm;
  verifyCallback(callback: PaymentCallback): boolean;
  refund(
    paymentId: string,
    amountPaise: number,
    requestToken: string,
  ): Promise<RefundRequestResult>;
  checkRefund(requestId: string): Promise<RefundStatusResult>;
  findRefund(paymentId: string, requestToken: string): Promise<RefundStatusResult | null>;
}
