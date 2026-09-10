import { createHash } from 'node:crypto';

import { injectable } from 'tsyringe';
import type { BookingDTO } from '@turfhood/shared';
import type {
  IPaymentService,
  OpenSessionPaymentInput,
  PaymentCallback,
  PaymentForm,
  RefundStatusResult,
} from '@domain/booking/services/IPaymentService';
import { RefundProviderError } from '@domain/booking/services/IPaymentService';
import { env } from '@config/env';

const sha512 = (value: string) => createHash('sha512').update(value).digest('hex');
const RETRYABLE_REFUND_ERROR_CODES = new Set([
  '120',
  '123',
  '231',
  '248',
  '249',
  '259',
  '261',
  '262',
  '264',
  '265',
  '267',
  '302',
  '500',
  '502',
]);
const POSSIBLY_CREATED_REFUND_CODES = new Set(['106', '109', '214', '225', '226', '227']);

const refundError = (message: unknown, code: unknown) => {
  const errorCode = String(code ?? '').trim();
  const providerMessage = String(message ?? 'Unknown error').trim();
  const details = errorCode ? `PayU error ${errorCode}: ${providerMessage}` : providerMessage;
  const requestMayExist =
    POSSIBLY_CREATED_REFUND_CODES.has(errorCode) ||
    /already used|already logged|request pending/i.test(providerMessage);
  const retryable =
    requestMayExist ||
    RETRYABLE_REFUND_ERROR_CODES.has(errorCode) ||
    /try after|temporary|lock/i.test(providerMessage);
  return new RefundProviderError(details, retryable, errorCode || undefined, requestMayExist);
};

@injectable()
export class PayUPaymentService implements IPaymentService {
  createForm(booking: BookingDTO, transactionId: string): PaymentForm {
    const amount = (booking.finalAmountPaise / 100).toFixed(2);
    const productinfo = `Turfhood booking ${booking.reference}`;
    const fields: Record<string, string> = {
      key: env.PAYU_MERCHANT_KEY,
      txnid: transactionId,
      amount,
      productinfo,
      firstname: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone ?? '',
      surl: `${env.BACKEND_PUBLIC_URL}/api/payments/payu/success`,
      furl: `${env.BACKEND_PUBLIC_URL}/api/payments/payu/failure`,
      udf1: booking.id,
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };
    fields.hash = sha512(
      `${fields.key}|${transactionId}|${amount}|${productinfo}|${fields.firstname}|${fields.email}|${fields.udf1}|${fields.udf2}|${fields.udf3}|${fields.udf4}|${fields.udf5}||||||${env.PAYU_MERCHANT_SALT}`,
    );
    return { action: env.PAYU_PAYMENT_URL, fields };
  }
  createOpenSessionForm(input: OpenSessionPaymentInput): PaymentForm {
    const amount = (input.amountPaise / 100).toFixed(2);
    const fields: Record<string, string> = {
      key: env.PAYU_MERCHANT_KEY,
      txnid: input.transactionId,
      amount,
      productinfo: input.description,
      firstname: input.customerName,
      email: input.customerEmail,
      phone: '',
      surl: `${env.BACKEND_PUBLIC_URL}/api/open-sessions/payu/success`,
      furl: `${env.BACKEND_PUBLIC_URL}/api/open-sessions/payu/failure`,
      udf1: input.sessionId,
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };
    fields.hash = sha512(
      `${fields.key}|${input.transactionId}|${amount}|${fields.productinfo}|${fields.firstname}|${fields.email}|${fields.udf1}|${fields.udf2}|${fields.udf3}|${fields.udf4}|${fields.udf5}||||||${env.PAYU_MERCHANT_SALT}`,
    );
    return { action: env.PAYU_PAYMENT_URL, fields };
  }
  verifyCallback(data: PaymentCallback): boolean {
    const expected = sha512(
      `${env.PAYU_MERCHANT_SALT}|${data.status}||||||${data.udf5 ?? ''}|${data.udf4 ?? ''}|${data.udf3 ?? ''}|${data.udf2 ?? ''}|${data.udf1 ?? ''}|${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${env.PAYU_MERCHANT_KEY}`,
    );
    return expected === data.hash;
  }
  async refund(paymentId: string, amountPaise: number, requestToken: string) {
    if (!/^\d+$/.test(paymentId))
      throw new RefundProviderError('PayU payment ID is missing or invalid.', false);
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0)
      throw new RefundProviderError('Refund amount must be a positive number of paise.', false);
    if (!requestToken.trim() || requestToken.length > 23)
      throw new RefundProviderError(
        'Refund token must contain between 1 and 23 characters.',
        false,
      );
    const command = 'cancel_refund_transaction';
    const body = new URLSearchParams({
      key: env.PAYU_MERCHANT_KEY,
      command,
      var1: paymentId,
      var2: requestToken,
      var3: (amountPaise / 100).toFixed(2),
      var5: `${env.BACKEND_PUBLIC_URL}/api/payments/payu/refund-webhook`,
      hash: sha512(`${env.PAYU_MERCHANT_KEY}|${command}|${paymentId}|${env.PAYU_MERCHANT_SALT}`),
    });
    const response = await fetch(env.PAYU_API_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) throw new Error(`PayU refund request failed with status ${response.status}.`);
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object')
      throw new Error('PayU returned an invalid refund response.');
    const result = payload as {
      status?: unknown;
      error_code?: unknown;
      request_id?: unknown;
      txn_update_id?: unknown;
      msg?: unknown;
    };
    const accepted = Number(result.status) === 1 || String(result.error_code) === '102';
    const requestId = String(result.request_id ?? result.txn_update_id ?? '').trim();
    if (!accepted || !requestId) throw refundError(result.msg, result.error_code);
    return { requestId };
  }

  async checkRefund(requestId: string): Promise<RefundStatusResult> {
    const command = 'check_action_status';
    const body = new URLSearchParams({
      key: env.PAYU_MERCHANT_KEY,
      command,
      var1: requestId,
      hash: sha512(`${env.PAYU_MERCHANT_KEY}|${command}|${requestId}|${env.PAYU_MERCHANT_SALT}`),
    });
    const response = await fetch(env.PAYU_API_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok)
      throw new Error(`PayU refund status request failed with status ${response.status}.`);
    const payload: unknown = await response.json();
    const action = this.findRefundAction(
      payload,
      (record) => String(record.request_id ?? '') === requestId,
    );
    if (!action) return { status: 'pending', providerStatus: 'not_available' };
    return this.toRefundStatus(action);
  }

  async findRefund(paymentId: string, requestToken: string): Promise<RefundStatusResult | null> {
    const command = 'check_action_status';
    const body = new URLSearchParams({
      key: env.PAYU_MERCHANT_KEY,
      command,
      var1: paymentId,
      var2: 'payuid',
      hash: sha512(`${env.PAYU_MERCHANT_KEY}|${command}|${paymentId}|${env.PAYU_MERCHANT_SALT}`),
    });
    const response = await fetch(env.PAYU_API_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok)
      throw new Error(`PayU action status request failed with status ${response.status}.`);
    const payload: unknown = await response.json();
    const action = this.findRefundAction(
      payload,
      (record) => String(record.token ?? '') === requestToken,
    );
    return action ? this.toRefundStatus(action) : null;
  }

  private toRefundStatus(action: Record<string, unknown>): RefundStatusResult {
    const providerStatus = String(action.status ?? '')
      .trim()
      .toLowerCase();
    const requestId = String(action.request_id ?? '').trim();
    if (providerStatus === 'success')
      return { status: 'success', providerStatus, ...(requestId ? { requestId } : {}) };
    if (providerStatus === 'failure' || providerStatus === 'failed') {
      const errorCode = String(action.error_code ?? action.statusCode ?? '').trim();
      return {
        status: 'failed',
        providerStatus,
        ...(requestId ? { requestId } : {}),
        reason: String(action.msg ?? action.error_Message ?? 'PayU refund failed.'),
        ...(errorCode ? { errorCode } : {}),
        retryable: refundError(action.msg ?? action.error_Message, errorCode).retryable,
      };
    }
    return {
      status: 'pending',
      providerStatus: providerStatus || 'unknown',
      ...(requestId ? { requestId } : {}),
    };
  }

  private findRefundAction(
    value: unknown,
    matches: (record: Record<string, unknown>) => boolean,
  ): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = this.findRefundAction(item, matches);
        if (found) return found;
      }
      return null;
    }
    const record = value as Record<string, unknown>;
    if (matches(record) && String(record.action ?? '').toLowerCase() === 'refund') return record;
    for (const child of Object.values(record)) {
      const found = this.findRefundAction(child, matches);
      if (found) return found;
    }
    return null;
  }
}
