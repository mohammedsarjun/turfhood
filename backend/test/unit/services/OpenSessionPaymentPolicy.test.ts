import { expect } from 'chai';
import {
  isOpenSessionPaymentExpired,
  openSessionPaymentCutoff,
} from '@domain/openSession/services/OpenSessionPaymentPolicy';

describe('OpenSessionPaymentPolicy', () => {
  const now = new Date('2026-09-07T12:00:00.000Z');

  it('expires an abandoned checkout after ten minutes', () => {
    expect(isOpenSessionPaymentExpired(new Date('2026-09-07T11:50:00.000Z'), now)).to.equal(true);
    expect(isOpenSessionPaymentExpired(new Date('2026-09-07T11:50:01.000Z'), now)).to.equal(false);
  });

  it('returns the cutoff used by participant and host cleanup', () => {
    expect(openSessionPaymentCutoff(now).toISOString()).to.equal('2026-09-07T11:50:00.000Z');
  });
});
