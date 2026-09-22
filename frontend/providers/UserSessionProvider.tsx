'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { PublicUser } from '@turfhood/shared';
import { getMe } from '@/features/profile/actions/profileApi';
import { ApiError } from '@/types/api/response';
import { isProtectedRoute } from '@/lib/auth/routeGuard';

const USER_STORAGE_KEY = 'turfhood.currentUser';

function isPublicUser(value: unknown): value is PublicUser {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Record<keyof PublicUser, unknown>>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    Array.isArray(candidate.roles) &&
    typeof candidate.isVerified === 'boolean' &&
    typeof candidate.status === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.hasPassword === 'boolean' &&
    Array.isArray(candidate.authProviders)
  );
}

interface UserSessionState {
  user: PublicUser | null;
  isHydrated: boolean;
  setUser: (user: PublicUser | null) => void;
  clearUser: () => void;
}

export const UserSessionContext = createContext<UserSessionState | null>(null);

function ProtectedRouteBoundary({ children }: { children: ReactNode }) {
  const session = useContext(UserSessionContext);
  const pathname = usePathname();
  const router = useRouter();
  const isProtected = isProtectedRoute(pathname);

  useEffect(() => {
    if (!isProtected) return;

    function redirectIfSessionWasCleared() {
      if (window.localStorage.getItem(USER_STORAGE_KEY)) return;
      session?.clearUser();
      router.replace('/login');
    }

    redirectIfSessionWasCleared();
    window.addEventListener('pageshow', redirectIfSessionWasCleared);
    window.addEventListener('storage', redirectIfSessionWasCleared);
    return () => {
      window.removeEventListener('pageshow', redirectIfSessionWasCleared);
      window.removeEventListener('storage', redirectIfSessionWasCleared);
    };
  }, [isProtected, router, session]);

  if (isProtected && !session?.isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center" aria-busy="true">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (isProtected && !session?.user) {
    return null;
  }

  return <>{children}</>;
}

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<PublicUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const setUser = useCallback((nextUser: PublicUser | null) => {
    setUserState(nextUser);
    if (nextUser) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const clearUser = useCallback(() => setUser(null), [setUser]);

  useEffect(() => {
    let isActive = true;

    async function hydrateSession() {
      await Promise.resolve();
      if (!isActive) return;

      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (!storedUser) {
        setIsHydrated(true);
        return;
      }

      try {
        const parsedUser: unknown = JSON.parse(storedUser);
        if (!isPublicUser(parsedUser)) throw new Error('Invalid cached user');
        setUserState(parsedUser);
      } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        setIsHydrated(true);
        return;
      }
      setIsHydrated(true);

      // Cached profile data renders immediately; this request only synchronizes UI data.
      // Route authentication and redirects remain the proxy's responsibility.
      try {
        const currentUser = await getMe();
        if (isActive) setUser(currentUser);
      } catch (error: unknown) {
        if (
          isActive &&
          error instanceof ApiError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          clearUser();
        }
      }
    }

    void hydrateSession();
    return () => {
      isActive = false;
    };
  }, [clearUser, setUser]);

  const value = useMemo(
    () => ({ user, isHydrated, setUser, clearUser }),
    [user, isHydrated, setUser, clearUser],
  );

  return (
    <UserSessionContext.Provider value={value}>
      <ProtectedRouteBoundary>{children}</ProtectedRouteBoundary>
    </UserSessionContext.Provider>
  );
}
