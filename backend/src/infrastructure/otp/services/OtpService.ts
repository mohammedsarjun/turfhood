import bcrypt from 'bcryptjs';
import { injectable } from 'tsyringe';
import type { IOtpService } from '@domain/otp/services/IOtpService';

const SALT_ROUNDS = 10;
const OTP_LENGTH = 6;

@injectable()
export class OtpService implements IOtpService {
  generate(): string {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;
    const code = Math.floor(min + Math.random() * (max - min + 1));
    return String(code);
  }

  async hash(otp: string): Promise<string> {
    return bcrypt.hash(otp, SALT_ROUNDS);
  }

  async compare(otp: string, otpHash: string): Promise<boolean> {
    return bcrypt.compare(otp, otpHash);
  }
}
