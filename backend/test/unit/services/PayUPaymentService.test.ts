import { expect } from 'chai';
import { PayUPaymentService } from '../../../src/infrastructure/booking/services/PayUPaymentService.js';

describe('PayUPaymentService refunds', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns PayU request_id only when refund initiation is accepted', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ status: 1, error_code: 102, request_id: 6582898821 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    const result = await new PayUPaymentService().refund('403993715521937565', 50000, 'token-1');
    expect(result).to.deep.equal({ requestId: '6582898821' });
  });

  it('maps a successful refund action to the terminal success state', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: 1,
          transaction_details: {
            '6582898821': {
              '6582898821': {
                request_id: '6582898821',
                action: 'refund',
                status: 'success',
              },
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    const result = await new PayUPaymentService().checkRefund('6582898821');
    expect(result).to.deep.equal({
      status: 'success',
      providerStatus: 'success',
      requestId: '6582898821',
    });
  });
});
