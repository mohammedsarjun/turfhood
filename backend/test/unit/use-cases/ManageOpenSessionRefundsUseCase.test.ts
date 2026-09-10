import { expect } from 'chai';

import { ManageOpenSessionsUseCase } from '../../../src/application/openSession/use-cases/ManageOpenSessionsUseCase.js';
import { RefundProviderError } from '../../../src/domain/booking/services/IPaymentService.js';

const paidSession = {
  id: 'session12345678',
  fillDeadline: '2099-01-01T00:00:00.000Z',
  participants: [{ userId: 'user12345678', paymentStatus: 'paid' }],
};

const createUseCase = (sessions: object, payments: object) =>
  new ManageOpenSessionsUseCase(
    sessions as never,
    payments as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

describe('ManageOpenSessionsUseCase refunds', () => {
  it('counts the attempt and immediately escalates PayU invalid-amount failures', async () => {
    let attemptCount = 0;
    let failure: { reason: string; terminal: boolean } | undefined;
    const sessions = {
      findById: async () => paidSession,
      beginParticipantCancellation: async () => ({
        paymentId: '403993715521937565',
        amountPaise: 50000,
      }),
      recordParticipantRefundAttempt: async (
        _sessionId: string,
        _userId: string,
        token: string,
      ) => {
        attemptCount += 1;
        expect(token.length).to.be.at.most(23);
        return true;
      },
      recordParticipantRefundFailure: async (
        _sessionId: string,
        _userId: string,
        reason: string,
        terminal: boolean,
      ) => {
        failure = { reason, terminal };
      },
    };
    const payments = {
      refund: async () => {
        throw new RefundProviderError(
          'PayU error 105: Refund FAILURE - Invalid amount',
          false,
          '105',
        );
      },
    };

    await createUseCase(sessions, payments).cancelParticipation('user12345678', 'session12345678');

    expect(attemptCount).to.equal(1);
    expect(failure).to.deep.equal({
      reason: 'PayU error 105: Refund FAILURE - Invalid amount',
      terminal: true,
    });
  });

  it('increments a retryable open-session refund attempt before retrying it', async () => {
    let attemptCount = 1;
    let requestId = '';
    const sessions = {
      expirePendingParticipants: async () => 0,
      listPendingParticipantRefunds: async () => [
        {
          sessionId: 'session12345678',
          userId: 'user12345678',
          paymentId: '403993715521937565',
          amountPaise: 50000,
          attemptCount,
        },
      ],
      expireUnfilled: async () => [],
      recordParticipantRefundAttempt: async () => {
        attemptCount += 1;
        return true;
      },
      markParticipantRefundRequested: async (
        _sessionId: string,
        _userId: string,
        value: string,
      ) => {
        requestId = value;
      },
    };
    const payments = { refund: async () => ({ requestId: 'payu-request-2' }) };

    await createUseCase(sessions, payments).expireUnfilled();

    expect(attemptCount).to.equal(2);
    expect(requestId).to.equal('payu-request-2');
  });
});
