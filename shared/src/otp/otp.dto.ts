import type { PublicUser } from '../user/types.js';
import type { OtpPurpose } from './otp-purpose.js';

export interface SendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface SendOtpResponse {
  message: string;
  expiresInSeconds: number;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpResponse {
  message: string;
  isVerified: true;
  user: PublicUser;
  accessToken: string;
}

export interface ResendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export type ResendOtpResponse = SendOtpResponse;
