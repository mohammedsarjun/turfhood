import type { OtpPurpose } from '@turfhood/shared';

export interface SendOtpEmailParams {
  to: string;
  otp: string;
  purpose: OtpPurpose;
  expiresInSeconds: number;
}

export interface IEmailService {
  sendOtpEmail(params: SendOtpEmailParams): Promise<void>;
}
