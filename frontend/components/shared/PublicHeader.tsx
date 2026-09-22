'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { withNextParam } from '@/lib/auth/redirect';
import { Header } from './Header';

const navLinks = [
  { href: '/turfs', label: 'Browse Turfs' },
  { href: '/open-sessions', label: 'Open Sessions' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isHydrated, clearUser } = useCurrentUser();
  const loginHref = `/login?${withNextParam(pathname)}`;

  if (isHydrated && user) {
    return <Header userName={user.name} avatarUrl={user.avatarUrl} onLoggedOut={clearUser} />;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Turfhood home">
          {/* eslint-disable-next-line @next/next/no-img-element -- static public logo asset */}
          <img src="/images/application-logo.png" alt="Turfhood" className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Public navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-700 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {isHydrated ? (
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={loginHref}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition hover:bg-muted"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Sign up
            </Link>
          </div>
        ) : (
          <div className="hidden h-10 w-40 rounded-md bg-muted md:block" aria-hidden="true" />
        )}

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-white px-4 py-4 md:hidden" aria-label="Mobile">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            {isHydrated && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href={loginHref}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
