import { expect } from 'chai';

import { RefundProviderError } from '../../../src/domain/booking/services/IPaymentService.js';
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

  it('sends the exact refund amount, callback URL, and idempotency token to PayU', async () => {
    let requestBody = '';
    globalThis.fetch = async (_input, init) => {
      requestBody = String(init?.body ?? '');
      return new Response(JSON.stringify({ status: 1, error_code: 102, txn_update_id: 42 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const result = await new PayUPaymentService().refund(
      '403993715521937565',
      50001,
      'rf-booking-1',
    );
    const params = new URLSearchParams(requestBody);

    expect(result).to.deep.equal({ requestId: '42' });
    expect(params.get('var1')).to.equal('403993715521937565');
    expect(params.get('var2')).to.equal('rf-booking-1');
    expect(params.get('var3')).to.equal('500.01');
    expect(params.get('var5')).to.match(/\/api\/payments\/payu\/refund-webhook$/);
  });

  it('classifies invalid amount as a permanent provider rejection', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ status: 0, error_code: 105, msg: 'Refund FAILURE - Invalid amount' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );

    try {
      await new PayUPaymentService().refund('403993715521937565', 50000, 'rf-booking-1');
      expect.fail('Expected refund initiation to fail.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefundProviderError);
      const providerError = error as RefundProviderError;
      expect(providerError.message).to.equal('PayU error 105: Refund FAILURE - Invalid amount');
      expect(providerError.retryable).to.equal(false);
      expect(providerError.errorCode).to.equal('105');
    }
  });

  it('preserves the request token when PayU may already have created the refund', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ status: 0, error_code: 225, msg: 'Refund request pending' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    try {
      await new PayUPaymentService().refund('403993715521937565', 50000, 'rf-booking-1');
      expect.fail('Expected refund initiation to fail.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefundProviderError);
      const providerError = error as RefundProviderError;
      expect(providerError.retryable).to.equal(true);
      expect(providerError.requestMayExist).to.equal(true);
    }
  });

  it('rejects an overlong PayU refund token before sending a request', async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return new Response();
    };

    try {
      await new PayUPaymentService().refund(
        '403993715521937565',
        50000,
        'this-token-is-more-than-twenty-three-characters',
      );
      expect.fail('Expected token validation to fail.');
    } catch (error) {
      expect(error).to.be.instanceOf(RefundProviderError);
      expect((error as RefundProviderError).retryable).to.equal(false);
      expect(called).to.equal(false);
    }
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
