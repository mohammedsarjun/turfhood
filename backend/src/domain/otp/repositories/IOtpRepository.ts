import type { OtpPurpose } from '@turfhub/shared';
import type { Email } from '@domain/user/value-objects/Email';

import type { OtpVerification } from '../entities/OtpVerification.js';

export interface IOtpRepository {
  create(otp: OtpVerification): Promise<OtpVerification>;
  findLatestActiveByEmail(email: Email, purpose: OtpPurpose): Promise<OtpVerification | null>;
  incrementAttemptCount(id: string): Promise<void>;
  markConsumed(id: string): Promise<void>;
  invalidateAllForEmail(email: Email, purpose: OtpPurpose): Promise<void>;
}
