'use client';

import { ChangePasswordForm } from './ChangePasswordForm';
import { SetPasswordForm } from './SetPasswordForm';
import type { PublicUser } from '../types';
import { useToast } from '@/components/ui';

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
  const { showToast } = useToast();

  if (!profile.hasPassword) {
    return (
      <div className="flex flex-col" style={{ gap: 8 }}>
        <SetPasswordForm
          onSuccess={(user) => {
            onUpdated(user);
            showToast('Password set successfully. You can now sign in with email.');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <ChangePasswordForm onSuccess={() => showToast('Password changed successfully.')} />
    </div>
  );
}
