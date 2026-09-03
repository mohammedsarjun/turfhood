import { expect } from 'chai';
import {
  calculateCustomerRefundPaise,
  canTransition,
} from '@domain/booking/services/BookingPolicy';

describe('BookingPolicy', () => {
  const now = new Date('2026-09-02T10:00:00.000Z');

  it('allows only declared booking status transitions', () => {
    expect(canTransition('pending_payment', 'confirmed')).to.equal(true);
    expect(canTransition('confirmed', 'payment_failed')).to.equal(false);
    expect(canTransition('refunded', 'confirmed')).to.equal(false);
  });

  it('returns a full refund during the ten-minute grace period', () => {
    expect(
      calculateCustomerRefundPaise({
        paidPaise: 100_000,
        confirmedAt: new Date(now.getTime() - 5 * 60_000),
        startsAt: new Date(now.getTime() + 2 * 60 * 60_000),
        now,
      }),
    ).to.equal(100_000);
  });

  it('applies full, half, and no-refund windows', () => {
    const confirmedAt = new Date(now.getTime() - 60 * 60_000);
    expect(
      calculateCustomerRefundPaise({
        paidPaise: 100_000,
        confirmedAt,
        startsAt: new Date(now.getTime() + 25 * 60 * 60_000),
        now,
      }),
    ).to.equal(100_000);
    expect(
      calculateCustomerRefundPaise({
        paidPaise: 100_000,
        confirmedAt,
        startsAt: new Date(now.getTime() + 12 * 60 * 60_000),
        now,
      }),
    ).to.equal(50_000);
    expect(
      calculateCustomerRefundPaise({
        paidPaise: 100_000,
        confirmedAt,
        startsAt: new Date(now.getTime() + 2 * 60 * 60_000),
        now,
      }),
    ).to.equal(0);
  });

  it('never refunds after play has started', () => {
    expect(
      calculateCustomerRefundPaise({
        paidPaise: 100_000,
        confirmedAt: new Date(now.getTime() - 60_000),
        startsAt: now,
        now,
      }),
    ).to.equal(0);
  });
});
