'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { adminLogout } from '@/features/admin-login';

export interface AdminHeaderProps {
  /** Shown only below the `md` breakpoint — opens the sidebar drawer. */
  onMenuClick?: () => void;
}

/** Minimal admin header: hamburger (mobile only) + logo + logout — no notification/profile elements. */
export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await adminLogout();
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  return (
    <header className="flex w-full items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center" style={{ gap: 12 }}>
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/admin/dashboard" className="flex items-center" aria-label="Turfhood admin home">
          {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, no next/image usage elsewhere in this repo */}
          <img src="/images/application-logo.png" alt="Turfhood" className="h-8 w-auto" />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={isLoggingOut}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
        style={{ gap: 8 }}
      >
        <LogOut className="h-4 w-4" />
        {isLoggingOut ? 'Logging out…' : 'Logout'}
      </button>
    </header>
  );
}
