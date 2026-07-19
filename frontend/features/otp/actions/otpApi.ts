import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpResponse,
} from '../types';

export async function sendOtp(payload: SendOtpRequest): Promise<ApiResponse<SendOtpResponse>> {
  const response = await axiosInstance.post<SendOtpResponse>(API_ROUTES.auth.otpSend, payload);
  return response.data;
}

export async function verifyOtp(
  payload: VerifyOtpRequest,
): Promise<ApiResponse<VerifyOtpResponse>> {
  const response = await axiosInstance.post<VerifyOtpResponse>(API_ROUTES.auth.otpVerify, payload);
  return response.data;
}

export async function resendOtp(): Promise<ApiResponse<ResendOtpResponse>> {
  const response = await axiosInstance.post<ResendOtpResponse>(API_ROUTES.auth.otpResend);
  return response.data;
}
