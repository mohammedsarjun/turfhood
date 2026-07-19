'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { OtpDigitInput, ResendControl } from '@/features/otp';
import { isOtpComplete } from '@/features/otp/lib/otpInput';
import { useEmailChange } from '../hooks/useEmailChange';
import type { PublicUser } from '../types';

interface EmailChangeSectionProps {
  profile: PublicUser;
  onUpdated: (user: PublicUser) => void;
}

export function EmailChangeSection({ profile, onUpdated }: EmailChangeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const {
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
    secondsLeft,
    isExpired,
  } = useEmailChange((user) => {
    onUpdated(user);
    setIsEditing(false);
  });

  if (step === 'verify') {
    return (
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span className="text-sm font-medium text-foreground">Email</span>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{pendingEmail}</span>.
          Your email stays <span className="font-medium text-foreground">{profile.email}</span> until
          you confirm the code.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submitOtp();
          }}
          noValidate
          className="flex flex-col"
          style={{ gap: 12 }}
        >
          <OtpDigitInput
            digits={digits}
            onChange={setDigits}
            hasError={Boolean(otpError)}
            disabled={isVerifying}
          />
          {otpError && (
            <p role="alert" className="text-xs text-destructive">
              {otpError}
            </p>
          )}
          <div className="flex" style={{ gap: 8 }}>
            <Button type="submit" loading={isVerifying} disabled={!isOtpComplete(digits)}>
              Confirm
            </Button>
            <Button type="button" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
          </div>
          <ResendControl secondsLeft={secondsLeft} isExpired={isExpired} onResend={() => void resend()} />
        </form>
      </div>
    );
  }

  const isGoogleLinked = profile.authProviders.includes('google');

  if (!isEditing) {
    return (
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span className="text-sm font-medium text-foreground">Email</span>
        <div className="flex items-center" style={{ gap: 8 }}>
          <Input value={profile.email} readOnly icon={<Mail className="h-4 w-4" />} />
          {!isGoogleLinked && (
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              Change
            </Button>
          )}
        </div>
        {isGoogleLinked && (
          <p className="text-xs text-muted-foreground">
            Your email is managed by Google and can&apos;t be changed here.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onRequestSubmit} noValidate className="flex flex-col" style={{ gap: 8 }}>
      <label htmlFor="profile-new-email" className="text-sm font-medium text-foreground">
        New email
      </label>
      <p className="text-xs text-muted-foreground">
        We&apos;ll send a verification code to this address. Your current email stays active until you
        confirm it.
      </p>
      <div className="flex items-start" style={{ gap: 8 }}>
        <Input
          id="profile-new-email"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          placeholder={profile.email}
          errorMessage={errors.newEmail?.message}
          {...register('newEmail')}
        />
        <Button type="submit" loading={isSubmitting}>
          Send code
        </Button>
        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
