'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOtp, resendOtp } from '../actions/otpApi';
import { OTP_LENGTH, buildOtpFromDigits, isOtpComplete } from '../lib/otpInput';
import { useCountdown } from './useCountdown';
import { DEFAULT_OTP_EXPIRY_SECONDS, OtpErrorCode, type OtpPurpose } from '../types';
import { tokenStorage } from '@/lib/tokenStorage';
import { ApiError } from '@/types/api/response';

export function useOtpVerification(email: string, purpose: OtpPurpose, initialExpiresInSeconds?: number) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [formError, setFormError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<OtpErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const countdownStorageKey = `turfhub_otp_deadline:${purpose}:${email}`;
  // Seeded from the actual expiry the backend just issued (passed through from the
  // send response), falling back to the shared default if it wasn't provided;
  // resend() re-syncs to the backend's actual configured window from its response.
  const countdown = useCountdown(initialExpiresInSeconds ?? DEFAULT_OTP_EXPIRY_SECONDS, countdownStorageKey);

  const submitOtp = async () => {
    if (!isOtpComplete(digits)) return;
    setFormError(null);
    setErrorCode(null);
    setIsSubmitting(true);

    try {
      const otp = buildOtpFromDigits(digits);
      const result = await verifyOtp({ email, otp, purpose });
      tokenStorage.set(result.accessToken);
      setIsVerified(true);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(countdownStorageKey);
      }
      router.push('/');
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        setErrorCode((error.code as OtpErrorCode) ?? null);
        setDigits(Array(OTP_LENGTH).fill(''));
      } else {
        setFormError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    setFormError(null);
    setErrorCode(null);
    try {
      const result = await resendOtp({ email, purpose });
      countdown.reset(result.expiresInSeconds);
      setDigits(Array(OTP_LENGTH).fill(''));
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again later.');
      }
    }
  };

  return {
    digits,
    setDigits,
    submitOtp,
    resend,
    formError,
    errorCode,
    isSubmitting,
    isVerified,
    secondsLeft: countdown.secondsLeft,
    isExpired: countdown.isExpired,
  };
}
