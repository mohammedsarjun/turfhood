import type { OtpPurpose } from '@turfhub/shared';

export interface SendOtpRequestDTO {
  email: string;
  purpose: OtpPurpose;
}
