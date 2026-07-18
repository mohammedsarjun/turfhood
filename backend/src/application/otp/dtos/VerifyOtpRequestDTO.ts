import type { OtpPurpose } from '@turfhood/shared';

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}
