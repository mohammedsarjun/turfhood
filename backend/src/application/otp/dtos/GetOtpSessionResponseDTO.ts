import type { OtpPurpose } from '@turfhood/shared';

export interface GetOtpSessionResponseDTO {
  maskedEmail: string;
  purpose: OtpPurpose;
  expiresAt: number;
}
