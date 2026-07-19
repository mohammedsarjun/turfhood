'use client';

import { Lock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useSetPassword } from '../hooks/useSetPassword';
import type { PublicUser } from '../types';

interface SetPasswordFormProps {
  onSuccess: (user: PublicUser) => void;
}

/** For Google-only accounts: no current-password field, since none exists yet on the account. */
export function SetPasswordForm({ onSuccess }: SetPasswordFormProps) {
  const { register, onSubmit, errors, isSubmitting, formError } = useSetPassword(onSuccess);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col" style={{ gap: 12 }}>
      <p className="text-sm text-muted-foreground">
        Your account currently signs in with Google only. Add a password to also sign in with your
        email address.
      </p>
      <div>
        <label htmlFor="set-new-password" className="text-sm font-medium text-foreground">
          New password
        </label>
        <Input
          id="set-new-password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          icon={<Lock className="h-4 w-4" />}
          errorMessage={errors.newPassword?.message}
          style={{ marginTop: 6 }}
          {...register('newPassword')}
        />
      </div>
      <div>
        <label htmlFor="set-confirm-new-password" className="text-sm font-medium text-foreground">
          Confirm new password
        </label>
        <Input
          id="set-confirm-new-password"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="h-4 w-4" />}
          errorMessage={errors.confirmNewPassword?.message}
          style={{ marginTop: 6 }}
          {...register('confirmNewPassword')}
        />
      </div>

      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" loading={isSubmitting}>
        Set password
      </Button>
    </form>
  );
}
