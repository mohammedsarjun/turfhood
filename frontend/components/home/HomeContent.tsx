'use client';

import Link from 'next/link';
import {
  CalendarCheck,
  CircleDollarSign,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from 'lucide-react';
import { PublicHeader } from '@/components/shared';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const highlights = [
  {
    icon: MapPin,
    title: 'Find nearby turfs',
    text: 'Search venues by city, compare sports facilities, and discover courts that fit your game.',
  },
  {
    icon: CalendarCheck,
    title: 'Book with confidence',
    text: 'Reserve slots, track bookings, handle payments, and manage refunds from one account.',
  },
  {
    icon: UsersRound,
    title: 'Play open sessions',
    text: 'Create or join shared games so empty slots become a full team faster.',
  },
  {
    icon: Trophy,
    title: 'Run your turf',
    text: 'Owners get a portal for courts, dashboards, revenue, payouts, and booking operations.',
  },
];

const steps = ['Choose your city', 'Pick a turf and court', 'Reserve a slot', 'Play your match'];

export function HomeContent() {
  const { user, isHydrated } = useCurrentUser();
  const isSignedIn = isHydrated && Boolean(user);

  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <section className="relative overflow-hidden border-b border-emerald-100 bg-emerald-50 text-slate-950">
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm text-emerald-800">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Turf booking, open sessions, and owner tools in one place
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Book better turfs and build better games.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Turfhood helps players discover sports venues, reserve courts, join open sessions,
              and gives turf owners a focused dashboard to manage daily operations.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!isSignedIn && (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-200 bg-white px-6 text-base font-semibold text-slate-800 transition hover:bg-emerald-100"
                  >
                    Login
                  </Link>
                </>
              )}
              <Link
                href="/turfs"
                className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-6 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Browse turfs
              </Link>
              {isSignedIn && (
                <Link
                  href="/bookings"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-emerald-200 bg-white px-6 text-base font-semibold text-slate-800 transition hover:bg-emerald-100"
                >
                  My bookings
                </Link>
              )}
            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-md border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">For players</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">From plan to play in minutes.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Compare venue options, keep your booking history organized, save favourites, and
              join open sessions when your squad needs a few more players.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-md border border-border bg-slate-50 p-4">
                <span className="text-sm font-semibold text-emerald-700">0{index + 1}</span>
                <p className="mt-3 text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold uppercase text-emerald-700">For turf owners</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Manage courts, revenue, payouts, and bookings.
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            Turfhood includes an owner portal for turf setup, court management, revenue tracking,
            payout requests, and day-to-day booking visibility.
          </p>
        </div>
        <div className="grid gap-3">
          <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <span className="font-medium">Verified onboarding workflow</span>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
            <CircleDollarSign className="h-5 w-5 text-emerald-700" />
            <span className="font-medium">Revenue and payout tracking</span>
          </div>
        </div>
      </section>

      <section className="border-t border-emerald-100 bg-emerald-50 px-4 py-14 text-slate-950 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Ready for your next game?</h2>
            <p className="mt-2 text-slate-600">
              {isSignedIn
                ? 'Browse turfs, manage your bookings, and keep your next match moving.'
                : 'Create an account or login to book, save favourites, and manage your matches.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isSignedIn ? (
              <>
                <Link
                  href="/turfs"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Browse turfs
                </Link>
                <Link
                  href="/bookings"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-emerald-100"
                >
                  My bookings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-emerald-100"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
