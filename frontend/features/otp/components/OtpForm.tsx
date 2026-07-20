'use client';

import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { useOtpVerification } from '../hooks/useOtpVerification';
import { OtpDigitInput } from './OtpDigitInput';
import { ResendControl } from './ResendControl';
import { isOtpComplete } from '../lib/otpInput';
import { OtpErrorCode, type OtpPurpose } from '../types';

interface OtpFormProps {
  /** Masked email rendered by the backend — the real address never reaches the client. */
  maskedEmail: string;
  purpose: OtpPurpose;
  /** Absolute deadline (ms since epoch) from the backend's otp session. */
  expiresAt: number;
}

export function OtpForm({ maskedEmail, purpose, expiresAt }: OtpFormProps) {
  const {
    digits,
    setDigits,
    submitOtp,
    resend,
    formError,
    errorCode,
    isSubmitting,
    isVerified,
    secondsLeft,
    isExpired,
  } = useOtpVerification(purpose, expiresAt);

  const isExpiredError = errorCode === OtpErrorCode.OTP_EXPIRED;

  if (isVerified) {
    return (
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-success">
          <ShieldCheck className="h-5 w-5 text-success-foreground" />
        </div>
        <h1 className="text-2xl font-medium text-foreground">Email verified</h1>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
          Taking you to your account…
        </p>
      </div>
    );
  }

  return (
    <div className="" style={{ marginTop: '20px', marginBottom: '20px' }}>
      <div className=" mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-success">
        <ShieldCheck className="h-5 w-5 text-success-foreground" />
      </div>

      <h1 className="text-2xl font-medium text-foreground">Enter verification code</h1>
      <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
        We sent a 6-digit code to <span className="font-medium text-foreground">{maskedEmail}</span>
        . Enter it below to continue.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submitOtp();
        }}
        noValidate
        className="flex flex-col"
        style={{ gap: 16, marginTop: 24 }}
      >
        <OtpDigitInput
          digits={digits}
          onChange={setDigits}
          hasError={Boolean(formError)}
          disabled={isSubmitting}
        />

        {formError && (
          <p
            role="alert"
            className={
              isExpiredError
                ? 'rounded-md bg-warning text-sm text-warning-foreground'
                : 'rounded-md bg-destructive/10 text-sm text-destructive'
            }
            style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }}
          >
            {formError}
          </p>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isOtpComplete(digits)}
          className="w-full"
        >
          Verify Code
        </Button>

        <ResendControl
          secondsLeft={secondsLeft}
          isExpired={isExpired}
          onResend={() => void resend()}
        />
      </form>
    </div>
  );
}
