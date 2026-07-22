import type { OtpPurpose } from '@turfhood/shared';

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

/** Body shape actually accepted from the client — email/purpose come from the verified otpSession cookie instead. */
export interface VerifyOtpBodyDTO {
  otp: string;
}
