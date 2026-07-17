export interface IOtpService {
  /** Generates a plaintext 6-digit numeric code. */
  generate(): string;
  hash(otp: string): Promise<string>;
  compare(otp: string, otpHash: string): Promise<boolean>;
}
