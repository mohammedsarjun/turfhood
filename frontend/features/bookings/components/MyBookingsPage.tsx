'use client';

import { useEffect, useState } from 'react';
import { Pagination } from '@/components/table';
import Link from 'next/link';
import type { BookingDTO, OpenSessionDTO } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Badge, Button, Heading, Spinner } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatTime12Hour } from '@/lib/time';
import { listMyBookings } from '../actions/bookingApi';
import { listMyOpenSessions } from '@/features/open-sessions/actions/openSessionApi';
import { OpenSessionCard } from '@/features/open-sessions/components/OpenSessionCard';

type Filter = 'upcoming' | 'completed' | 'cancelled';

export function MyBookingsPage() {
  const { user, clearUser } = useCurrentUser();
  const [items, setItems] = useState<BookingDTO[]>([]);
  const [openSessions, setOpenSessions] = useState<OpenSessionDTO[]>([]);
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionTotalPages, setSessionTotalPages] = useState(1);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');

  const requestKey = `${page}:${sessionPage}:${filter}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;
    void Promise.all([listMyBookings(page, filter), listMyOpenSessions(sessionPage, filter)])
      .then(([bookingResult, sessionResult]) => {
        if (!active) return;
        setError('');
        setItems(bookingResult.items);
        setTotalPages(bookingResult.pagination.totalPages);
        setOpenSessions(sessionResult.items);
        setSessionTotalPages(sessionResult.pagination.totalPages);
      })
      .catch(() => {
        if (active) setError('Unable to load your bookings.');
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey);
      });
    return () => {
      active = false;
    };
  }, [page, sessionPage, filter, requestKey]);

  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Heading variant="h1">My Bookings</Heading>
        <p className="mt-2 text-muted-foreground">
          View payments, upcoming games, and cancellations.
        </p>
        <div className="mt-6 flex gap-2">
          {(['upcoming', 'completed', 'cancelled'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? 'primary' : 'outline'}
              onClick={() => {
                setFilter(value);
                setPage(1);
                setSessionPage(1);
              }}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </Button>
          ))}
        </div>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p role="alert" className="mt-6 text-destructive">
            {error}
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {openSessions.length > 0 && (
              <section aria-labelledby="my-open-sessions-heading">
                <div className="mb-4">
                  <h2 id="my-open-sessions-heading" className="text-xl font-semibold">
                    Open sessions
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sessions you created or joined as a paid participant.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {openSessions.map((session) => (
                    <OpenSessionCard key={session.id} session={session} />
                  ))}
                </div>
                <Pagination
                  page={sessionPage}
                  totalPages={sessionTotalPages}
                  onPageChange={setSessionPage}
                />
              </section>
            )}
            {openSessions.length > 0 && items.length > 0 && (
              <h2 className="pt-3 text-xl font-semibold">Court bookings</h2>
            )}
            {items.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block rounded-xl border border-border bg-card p-5 transition hover:border-primary"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{booking.reference}</p>
                    {booking.bookingType === 'open_session' && (
                      <Badge variant="outline" className="mt-2">
                        Open session
                      </Badge>
                    )}
                    <h2 className="mt-1 text-lg font-semibold">
                      {booking.turfName} - {booking.courtName}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(`${booking.bookingDate}T00:00:00`).toLocaleDateString('en-IN', {
                        dateStyle: 'medium',
                      })}{' '}
                      - {booking.slots.map((slot) => formatTime12Hour(slot.startTime)).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        booking.status === 'confirmed'
                          ? 'success'
                          : booking.status.includes('cancelled')
                            ? 'destructive'
                            : 'warning'
                      }
                    >
                      {booking.status.replaceAll('_', ' ')}
                    </Badge>
                    <p className="mt-3 font-bold">
                      Rs.{' '}
                      {(
                        ((booking.bookingType === 'open_session'
                          ? booking.customerSharePaise
                          : booking.finalAmountPaise) ?? booking.finalAmountPaise) / 100
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    {booking.bookingType === 'open_session' && (
                      <p className="mt-1 text-xs text-muted-foreground">Your share</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {!items.length && !openSessions.length && (
              <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                No {filter} bookings.
              </p>
            )}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </main>
    </>
  );
}
