import type { OtpPurpose } from '@turfhood/shared';

export interface SendOtpRequestDTO {
  email: string;
  purpose: OtpPurpose;
}
