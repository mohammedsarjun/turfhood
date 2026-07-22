import type { OtpPurpose } from '@turfhood/shared';

export interface SendOtpEmailParams {
  to: string;
  otp: string;
  purpose: OtpPurpose;
  expiresInSeconds: number;
}

export interface SendPasswordResetEmailParams {
  to: string;
  resetLink: string;
  expiresInSeconds: number;
}

export interface IEmailService {
  sendOtpEmail(params: SendOtpEmailParams): Promise<void>;
  sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<void>;
}
