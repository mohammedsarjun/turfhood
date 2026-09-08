'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([listMyBookings(), listMyOpenSessions()])
      .then(([bookingResult, sessionResult]) => {
        setItems(bookingResult.items);
        setTotalPages(bookingResult.pagination.totalPages);
        setOpenSessions(sessionResult.items);
        setSessionTotalPages(sessionResult.pagination.totalPages);
      })
      .catch(() => setError('Unable to load your bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((booking) => {
        if (filter === 'cancelled')
          return booking.status.includes('cancelled') || booking.status.includes('refunded');
        if (filter === 'completed') return booking.status === 'completed';
        return booking.status === 'confirmed';
      }),
    [filter, items],
  );

  const filteredOpenSessions = useMemo(
    () =>
      openSessions.filter((session) => {
        if (filter === 'cancelled') return session.status === 'cancelled';
        if (filter === 'completed') return session.status === 'completed';
        return session.status === 'open' || session.status === 'full';
      }),
    [filter, openSessions],
  );

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await listMyBookings(nextPage);
      setItems((current) => [...current, ...result.items]);
      setPage(nextPage);
      setTotalPages(result.pagination.totalPages);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreSessions = async () => {
    setLoadingMore(true);
    try {
      const nextPage = sessionPage + 1;
      const result = await listMyOpenSessions(nextPage);
      setOpenSessions((current) => [...current, ...result.items]);
      setSessionPage(nextPage);
      setSessionTotalPages(result.pagination.totalPages);
    } finally {
      setLoadingMore(false);
    }
  };

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
              onClick={() => setFilter(value)}
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
            {filteredOpenSessions.length > 0 && (
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
                  {filteredOpenSessions.map((session) => (
                    <OpenSessionCard key={session.id} session={session} />
                  ))}
                </div>
                {sessionPage < sessionTotalPages && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      loading={loadingMore}
                      onClick={() => void loadMoreSessions()}
                    >
                      Load more sessions
                    </Button>
                  </div>
                )}
              </section>
            )}
            {filteredOpenSessions.length > 0 && filtered.length > 0 && (
              <h2 className="pt-3 text-xl font-semibold">Court bookings</h2>
            )}
            {filtered.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block rounded-xl border border-border bg-card p-5 transition hover:border-primary"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{booking.reference}</p>
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
                      Rs. {(booking.finalAmountPaise / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {!filtered.length && !filteredOpenSessions.length && (
              <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                No {filter} bookings.
              </p>
            )}
            {page < totalPages && (
              <div className="flex justify-center">
                <Button variant="outline" loading={loadingMore} onClick={() => void loadMore()}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
