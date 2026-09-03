import type { BookingDTO } from '@turfhood/shared';
export interface PaymentForm {
  action: string;
  fields: Record<string, string>;
}
export interface RefundRequestResult {
  requestId: string;
}
export interface RefundStatusResult {
  status: 'pending' | 'success' | 'failed';
  providerStatus: string;
  requestId?: string;
  reason?: string;
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
  verifyCallback(callback: PaymentCallback): boolean;
  refund(
    paymentId: string,
    amountPaise: number,
    requestToken: string,
  ): Promise<RefundRequestResult>;
  checkRefund(requestId: string): Promise<RefundStatusResult>;
  findRefund(paymentId: string, requestToken: string): Promise<RefundStatusResult | null>;
}
