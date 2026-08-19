'use client';

import { Header } from '@/components/shared';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function HomeContent() {
  const { user, clearUser } = useCurrentUser();
  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="min-h-screen">
        <h1>Turfhood</h1>
      </main>
    </>
  );
}
