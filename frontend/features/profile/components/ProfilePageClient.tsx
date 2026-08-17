'use client';

import { useEffect, useState } from 'react';
import { getMe } from '../actions/profileApi';
import type { PublicUser } from '../types';
import { ProfileContent } from './ProfileContent';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function ProfilePageClient() {
  const { user: currentUser, isHydrated, setUser: setCurrentUser } = useCurrentUser();
  const [user, setUser] = useState<PublicUser | null>(currentUser);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (currentUser) {
      setUser(currentUser);
      return;
    }

    let isActive = true;
    void getMe()
      .then((currentUser) => {
        if (isActive) {
          setUser(currentUser);
          setCurrentUser(currentUser);
        }
      })
      .catch(() => {
        if (isActive) setLoadFailed(true);
      });
    return () => {
      isActive = false;
    };
  }, [currentUser, isHydrated, setCurrentUser]);

  if (loadFailed) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-destructive">Unable to load your profile.</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center" aria-busy="true">
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </main>
    );
  }

  return <ProfileContent initialProfile={user} />;
}
