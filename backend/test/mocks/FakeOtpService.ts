import type { IOtpService } from '../../src/domain/otp/services/IOtpService.js';

const HASH_PREFIX = 'hashed-';

/**
 * Deterministic stand-in for the real bcrypt-backed OtpService.
 * generate() always returns the same code so tests can assert exact values;
 * hash/compare use a trivial reversible scheme instead of real bcrypt.
 */
export class FakeOtpService implements IOtpService {
  constructor(private readonly fixedOtp: string = '123456') {}

  generate(): string {
    return this.fixedOtp;
  }

  async hash(otp: string): Promise<string> {
    return `${HASH_PREFIX}${otp}`;
  }

  async compare(otp: string, otpHash: string): Promise<boolean> {
    return otpHash === `${HASH_PREFIX}${otp}`;
  }
}
