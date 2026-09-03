'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/ui';
import { UserSessionProvider } from '@/providers/UserSessionProvider';
import { isAdminRoute } from '@/lib/auth/routeGuard';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Admin auth uses separate cookies and endpoints. Mounting the regular user session provider
  // here would call /users/me and incorrectly trigger admin refresh handling on admin pages.
  if (isAdminRoute(pathname)) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserSessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </UserSessionProvider>
    </GoogleOAuthProvider>
  );
}
