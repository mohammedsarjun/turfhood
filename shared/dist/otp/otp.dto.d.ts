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
    otp: string;
}
export interface VerifyOtpResponse {
    message: string;
    isVerified: true;
    user: PublicUser;
    accessToken: string;
}
export type ResendOtpResponse = SendOtpResponse;
