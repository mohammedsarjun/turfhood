'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { confirmEmailChange, requestEmailChange } from '../actions/profileApi';
import { changeEmailSchema, type ChangeEmailFormValues } from '../schema/changeEmailSchema';
import type { PublicUser } from '../types';
import { OTP_LENGTH, buildOtpFromDigits, isOtpComplete } from '@/features/otp/lib/otpInput';
import { useCountdown } from '@/features/otp';
import { ApiError } from '@/types/api/response';
import { useToast } from '@/components/ui';

type Step = 'request' | 'verify';

/**
 * Two-step email-change flow: request a code for the new address, then confirm it.
 * Reuses the otp feature's low-level primitives (digit-input helpers, countdown) rather than
 * the top-level OtpForm/useOtpVerification, which are hardwired to the signup/login otpSession
 * cookie and redirect-to-'/' — not a fit for this in-page, authenticated, dual-cookie flow.
 */
export function useEmailChange(onSuccess: (user: PublicUser) => void) {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('request');
  const [pendingEmail, setPendingEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const countdown = useCountdown(expiresAt);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: '' },
  });

  const submitRequest = async ({ newEmail }: ChangeEmailFormValues) => {
    try {
      const result = await requestEmailChange({ newEmail });
      // eslint-disable-next-line react-hooks/purity -- runs only on submit (post-await), never during render; matches useOtpVerification's resend().
      const now = Date.now();
      setPendingEmail(newEmail);
      setExpiresAt(now + result.expiresInSeconds * 1000);
      setDigits(Array(OTP_LENGTH).fill(''));
      setStep('verify');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors?.newEmail?.[0]) {
          setError('newEmail', { message: error.errors.newEmail[0] });
        } else {
          setError('newEmail', { message: error.message });
        }
      } else {
        setError('newEmail', { message: 'Something went wrong. Please try again later.' });
      }
    }
  };
  const onRequestSubmit = handleSubmit(submitRequest);

  const submitOtp = async () => {
    if (!isOtpComplete(digits)) return;
    setOtpError(null);
    setIsVerifying(true);
    try {
      const otp = buildOtpFromDigits(digits);
      const result = await confirmEmailChange({ otp });
      onSuccess(result.user);
      showToast('Email updated successfully.');
      setStep('request');
      setPendingEmail('');
    } catch (error) {
      if (error instanceof ApiError) {
        setOtpError(error.message);
        setDigits(Array(OTP_LENGTH).fill(''));
      } else {
        setOtpError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    setOtpError(null);
    try {
      const result = await requestEmailChange({ newEmail: pendingEmail });
      setExpiresAt(Date.now() + result.expiresInSeconds * 1000);
      setDigits(Array(OTP_LENGTH).fill(''));
    } catch (error) {
      if (error instanceof ApiError) {
        setOtpError(error.message);
      } else {
        setOtpError('Something went wrong. Please try again later.');
      }
    }
  };

  const cancel = () => {
    setStep('request');
    setPendingEmail('');
    setOtpError(null);
  };

  return {
    step,
    pendingEmail,
    register,
    onRequestSubmit,
    errors,
    isSubmitting,
    digits,
    setDigits,
    submitOtp,
    resend,
    cancel,
    otpError,
    isVerifying,
    secondsLeft: countdown.secondsLeft,
    isExpired: countdown.isExpired,
  };
}
