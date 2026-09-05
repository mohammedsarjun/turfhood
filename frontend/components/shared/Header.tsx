'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CalendarCheck,
  Home,
  Heart,
  LogOut,
  Menu,
  Search,
  UsersRound,
  Store,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth/logoutApi';
import { useMyApplication } from '@/features/turf-onboarding/hooks/useMyApplication';

export interface HeaderProps {
  userName?: string;
  avatarUrl?: string;
  onLoggedOut?: () => void;
}

/**
 * Reusable top navigation bar: logo, a dummy notification bell, and a profile avatar whose
 * dropdown (Profile / Logout) opens on click rather than pure CSS hover — hover has no
 * equivalent on touch devices, so click-to-toggle is what actually works on mobile too.
 */
export function Header({ userName, avatarUrl, onLoggedOut }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { application } = useMyApplication();
  const turfOwnerLinkHref = application ? '/my-turfs' : '/become-a-turf-owner';
  const turfOwnerLinkLabel = application ? 'My Turfs' : 'Become a Turf Owner';

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      onLoggedOut?.();
      setIsMenuOpen(false);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="relative flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
      <Link href="/" className="flex items-center" aria-label="Turfhood home">
        {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, no next/image usage elsewhere in this repo */}
        <img src="/images/application-logo.png" alt="Turfhood" className="h-8 w-auto" />
      </Link>

      <nav className="hidden items-center gap-5 md:flex" aria-label="Main navigation">
        <Link href="/" className="text-sm font-medium text-foreground hover:text-primary">
          Home
        </Link>
        <Link href="/turfs" className="text-sm font-medium text-foreground hover:text-primary">
          Find Turfs
        </Link>
        <Link
          href="/open-sessions"
          className="text-sm font-medium text-foreground hover:text-primary"
        >
          Open Sessions
        </Link>
      </nav>

      <div className="flex items-center" style={{ gap: 12 }}>
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setIsMobileNavOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted md:hidden"
        >
          {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="Account menu"
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted ring-offset-2 hover:ring-2 hover:ring-ring"
          >
            <Avatar src={avatarUrl} iconClassName="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className={cn(
                'absolute right-0 z-10 mt-2 w-48 rounded-md border border-border bg-card shadow-lg',
              )}
              style={{ paddingTop: 4, paddingBottom: 4 }}
            >
              {userName && (
                <div className="border-b border-border px-3 py-2 text-sm font-medium text-foreground">
                  {userName}
                </div>
              )}
              <Link
                href="/open-sessions"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <UsersRound className="h-4 w-4" /> Open Sessions
              </Link>
              <Link
                href="/bookings"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <CalendarCheck className="h-4 w-4" /> My Bookings
              </Link>
              <Link
                href="/favorites"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Heart className="h-4 w-4" /> My Favourites
              </Link>
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center text-sm text-foreground hover:bg-muted"
                style={{
                  gap: 8,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href={turfOwnerLinkHref}
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center text-sm text-foreground hover:bg-muted"
                style={{
                  gap: 8,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
              >
                <Store className="h-4 w-4" />
                {turfOwnerLinkLabel}
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="flex w-full items-center text-sm text-destructive hover:bg-muted disabled:opacity-50"
                style={{
                  gap: 8,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
      {isMobileNavOpen && (
        <nav
          className="absolute left-0 right-0 top-full z-20 border-b border-border bg-card p-4 shadow-lg md:hidden"
          aria-label="Mobile navigation"
        >
          <Link
            href="/"
            onClick={() => setIsMobileNavOpen(false)}
            className="mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/turfs"
            onClick={() => setIsMobileNavOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Search className="h-4 w-4" />
            Find Turfs
          </Link>
          <Link
            href="/open-sessions"
            onClick={() => setIsMobileNavOpen(false)}
            className="mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <UsersRound className="h-4 w-4" />
            Open Sessions
          </Link>
        </nav>
      )}
    </header>
  );
}
