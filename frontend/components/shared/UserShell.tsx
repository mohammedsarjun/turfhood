'use client';

import type { ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Header } from './Header';

/** Supplies shared user chrome after the proxy has authorized the route. */
export function UserShell({ children }: { children: ReactNode }) {
  const { user, clearUser } = useCurrentUser();
  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      {children}
    </>
  );
}
