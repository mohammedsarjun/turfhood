import type { BookingStatus } from '@turfhood/shared';

const VALID_TRANSITIONS: Readonly<Record<BookingStatus, readonly BookingStatus[]>> = {
  pending_payment: ['confirmed', 'payment_failed', 'expired'],
  confirmed: ['cancelled_by_user', 'cancelled_by_owner', 'completed'],
  payment_failed: [],
  cancelled_by_user: ['refunded', 'partially_refunded'],
  cancelled_by_owner: ['refunded'],
  expired: [],
  completed: [],
  refunded: [],
  partially_refunded: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function calculateCustomerRefundPaise(params: {
  paidPaise: number;
  confirmedAt: Date;
  startsAt: Date;
  now: Date;
}): number {
  const untilStartMs = params.startsAt.getTime() - params.now.getTime();
  if (untilStartMs <= 0) return 0;

  const withinGracePeriod = params.now.getTime() - params.confirmedAt.getTime() <= 10 * 60_000;
  if (withinGracePeriod || untilStartMs >= 24 * 60 * 60_000) return params.paidPaise;
  if (untilStartMs >= 6 * 60 * 60_000) return Math.round(params.paidPaise / 2);
  return 0;
}
