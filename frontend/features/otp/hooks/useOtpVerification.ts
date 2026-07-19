'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOtp, resendOtp } from '../actions/otpApi';
import { OTP_LENGTH, buildOtpFromDigits, isOtpComplete } from '../lib/otpInput';
import { useCountdown } from './useCountdown';
import { OtpErrorCode, type OtpPurpose } from '../types';
import { ApiError } from '@/types/api/response';

export function useOtpVerification(purpose: OtpPurpose, initialExpiresAt: number) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [formError, setFormError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<OtpErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const countdown = useCountdown(expiresAt);

  const submitOtp = async () => {
    if (!isOtpComplete(digits)) return;
    setFormError(null);
    setErrorCode(null);
    setIsSubmitting(true);

    try {
      const otp = buildOtpFromDigits(digits);
      await verifyOtp({ otp });
      setIsVerified(true);
      // replace (not push): once verified, /otp must not remain a back-button target.
      router.replace('/');
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
      const result = await resendOtp();
      setExpiresAt(Date.now() + result.expiresInSeconds * 1000);
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
