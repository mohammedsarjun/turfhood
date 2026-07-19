'use client';

import { Lock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useChangePassword } from '../hooks/useChangePassword';

interface ChangePasswordFormProps {
  onSuccess: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { register, onSubmit, errors, isSubmitting, formError } = useChangePassword(onSuccess);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col" style={{ gap: 12 }}>
      <div>
        <label htmlFor="current-password" className="text-sm font-medium text-foreground">
          Current password
        </label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          icon={<Lock className="h-4 w-4" />}
          errorMessage={errors.currentPassword?.message}
          style={{ marginTop: 6 }}
          {...register('currentPassword')}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="text-sm font-medium text-foreground">
          New password
        </label>
        <Input
          id="new-password"
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
        <label htmlFor="confirm-new-password" className="text-sm font-medium text-foreground">
          Confirm new password
        </label>
        <Input
          id="confirm-new-password"
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
        Change password
      </Button>
    </form>
  );
}
