'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Eye, EyeOff, Lock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useChangePassword } from '../hooks/useChangePassword';
import { hasLetter, hasMinLength, hasNumber, passwordsMatch } from '../lib/passwordRules';
import { PasswordResetErrorCode } from '../types';

interface ChangePasswordFormProps {
  token: string;
}

const fieldLabelClass = 'block text-sm font-medium text-foreground';
const fieldLabelStyle = { marginBottom: 6 };

const TOKEN_ERROR_MESSAGES: Record<PasswordResetErrorCode, string> = {
  [PasswordResetErrorCode.RESET_TOKEN_INVALID]: 'This password reset link is invalid.',
  [PasswordResetErrorCode.RESET_TOKEN_EXPIRED]:
    'This password reset link has expired. Please request a new one.',
  [PasswordResetErrorCode.RESET_TOKEN_ALREADY_USED]:
    'This password reset link has already been used.',
};

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className="flex items-center text-xs"
      style={{ gap: 6, color: met ? undefined : undefined }}
    >
      <span
        className={
          met
            ? 'flex h-4 w-4 items-center justify-center rounded-full bg-success text-success-foreground'
            : 'flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground'
        }
      >
        <Check className="h-3 w-3" />
      </span>
      <span className={met ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </li>
  );
}

export function ChangePasswordForm({ token }: ChangePasswordFormProps) {
  const { register, onSubmit, errors, isSubmitting, formError, tokenError, watch } =
    useChangePassword(token);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  if (tokenError) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-foreground">Link no longer valid</h1>
        <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
          {TOKEN_ERROR_MESSAGES[tokenError]}
        </p>
        <p className="text-center text-sm text-muted-foreground" style={{ marginTop: 24 }}>
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-medium text-foreground">Change Password</h1>
      <p className="text-sm text-muted-foreground" style={{ marginTop: 4 }}>
        Your new password must be different from your previous password.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col"
        style={{ gap: 16, marginTop: 24 }}
      >
        <div>
          <label htmlFor="new-password" className={fieldLabelClass} style={fieldLabelStyle}>
            New Password
          </label>
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            icon={<Lock className="h-4 w-4" />}
            errorMessage={errors.newPassword?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('newPassword')}
          />
          <ul className="flex flex-wrap" style={{ gap: 12, marginTop: 8 }}>
            <Requirement met={hasMinLength(newPassword ?? '')} label="8+ characters" />
            <Requirement met={hasLetter(newPassword ?? '')} label="Letter" />
            <Requirement met={hasNumber(newPassword ?? '')} label="Number" />
          </ul>
        </div>

        <div>
          <label htmlFor="confirm-password" className={fieldLabelClass} style={fieldLabelStyle}>
            Confirm New Password
          </label>
          <Input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            icon={<Lock className="h-4 w-4" />}
            errorMessage={errors.confirmPassword?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('confirmPassword')}
          />
          {!errors.confirmPassword && passwordsMatch(newPassword ?? '', confirmPassword ?? '') && (
            <p className="text-xs text-success-foreground" style={{ marginTop: 6 }}>
              Passwords match.
            </p>
          )}
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 text-sm text-destructive"
            style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }}
          >
            {formError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Change Password
        </Button>
      </form>
    </div>
  );
}
