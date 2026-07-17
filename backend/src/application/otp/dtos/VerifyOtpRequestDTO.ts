import type { OtpPurpose } from '@turfhub/shared';

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}
