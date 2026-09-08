import { OPEN_SESSION_PAYMENT_WINDOW_MS } from '../constants.js';

export const openSessionPaymentCutoff = (now: Date): Date =>
  new Date(now.getTime() - OPEN_SESSION_PAYMENT_WINDOW_MS);

export const isOpenSessionPaymentExpired = (createdAt: Date, now: Date): boolean =>
  createdAt.getTime() <= openSessionPaymentCutoff(now).getTime();
