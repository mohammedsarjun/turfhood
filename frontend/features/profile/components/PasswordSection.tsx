'use client';

import { useState } from 'react';
import { ChangePasswordForm } from './ChangePasswordForm';
import { SetPasswordForm } from './SetPasswordForm';
import type { PublicUser } from '../types';

interface PasswordSectionProps {
  profile: PublicUser;
  onUpdated: (user: PublicUser) => void;
}

/**
 * Renders the change-password flow for accounts that already have a password, or the
 * set-password flow for Google-only accounts that don't — decided by `hasPassword`
 * from the fetched profile, never by the (fully removable) authProviders list alone.
 */
export function PasswordSection({ profile, onUpdated }: PasswordSectionProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!profile.hasPassword) {
    return (
      <div className="flex flex-col" style={{ gap: 8 }}>
        <SetPasswordForm
          onSuccess={(user) => {
            onUpdated(user);
            setSuccessMessage('Password set. You can now sign in with your email too.');
          }}
        />
        {successMessage && (
          <p role="status" className="text-xs text-success-foreground">
            {successMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <ChangePasswordForm onSuccess={() => setSuccessMessage('Password changed successfully.')} />
      {successMessage && (
        <p role="status" className="text-xs text-success-foreground">
          {successMessage}
        </p>
      )}
    </div>
  );
}
