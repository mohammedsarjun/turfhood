'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth/logoutApi';

export interface HeaderProps {
  userName: string;
  avatarUrl?: string;
}

/**
 * Reusable top navigation bar: logo, a dummy notification bell, and a profile avatar whose
 * dropdown (Profile / Logout) opens on click rather than pure CSS hover — hover has no
 * equivalent on touch devices, so click-to-toggle is what actually works on mobile too.
 */
export function Header({ userName, avatarUrl }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      setIsMenuOpen(false);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
      <Link href="/" className="flex items-center" aria-label="Turfhood home">
        {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, no next/image usage elsewhere in this repo */}
        <img src="/images/application-logo.png" alt="Turfhood" className="h-8 w-auto" />
      </Link>

      <div className="flex items-center" style={{ gap: 12 }}>
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
              <div className="border-b border-border px-3 py-2 text-sm font-medium text-foreground">
                {userName}
              </div>
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
    </header>
  );
}
