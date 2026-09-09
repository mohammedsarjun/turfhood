'use client';
/* eslint-disable @next/next/no-img-element -- court images use deployment-specific CDN URLs */
import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, IndianRupee, UsersRound } from 'lucide-react';
import type { OpenSessionDTO, OpenSessionStatus } from '@turfhood/shared';
import { Badge, Spinner } from '@/components/ui';
import { formatTime12Hour } from '@/lib/time';
import { useOwnerOpenSessions } from '../hooks/useOwnerOpenSessions';
import { SessionParticipants } from './SessionParticipants';
type Filter = 'all' | 'active' | 'completed' | 'cancelled';
export function OwnerOpenSessionsPage({ turfId }: { turfId: string }) {
  const { data, loading, error } = useOwnerOpenSessions(turfId);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string>();
  const sessions = useMemo(
    () =>
      (data?.items ?? []).filter(
        (session) =>
          filter === 'all' ||
          (filter === 'active'
            ? ['open', 'full', 'awaiting_creator_payment'].includes(session.status)
            : session.status === filter),
      ),
    [data, filter],
  );
  if (loading)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-destructive">
        {error}
      </div>
    );
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div>
        <p className="text-sm font-semibold text-primary">COMMUNITY PLAY</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Open sessions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          See session progress and the players joining your courts.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'completed', 'cancelled'] as Filter[]).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${filter === item ? 'bg-primary text-primary-foreground' : 'border border-border bg-card hover:bg-muted'}`}
          >
            {item}
          </button>
        ))}
      </div>
      {sessions.length ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              expanded={expanded === session.id}
              onToggle={() =>
                setExpanded((current) => (current === session.id ? undefined : session.id))
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <UsersRound className="mx-auto text-muted-foreground" size={34} />
          <p className="mt-3 font-medium">No open sessions found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sessions created for this turf will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
function SessionCard({
  session,
  expanded,
  onToggle,
}: {
  session: OpenSessionDTO;
  expanded: boolean;
  onToggle: () => void;
}) {
  const paid = session.participants.filter(
    (participant) => participant.paymentStatus === 'paid',
  ).length;
  const percent = Math.min(100, (paid / session.maximumPlayers) * 100);
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid md:grid-cols-[180px_1fr]">
        <div className="relative min-h-36 bg-muted">
          {session.courtImage ? (
            <img
              src={session.courtImage}
              alt={session.courtName}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <UsersRound className="absolute inset-0 m-auto text-muted-foreground" size={36} />
          )}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{session.sportName} session</h2>
                <StatusBadge status={session.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{session.courtName}</p>
            </div>
            <button
              onClick={onToggle}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {expanded ? 'Hide players' : 'View players'}
            </button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Detail
              icon={CalendarDays}
              value={new Date(`${session.bookingDate}T00:00:00`).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            />
            <Detail
              icon={Clock3}
              value={`${formatTime12Hour(session.startTime)} - ${formatTime12Hour(session.endTime)}`}
            />
            <Detail icon={UsersRound} value={`${paid}/${session.maximumPlayers} joined`} />
            <Detail
              icon={IndianRupee}
              value={`₹${(session.pricePerParticipantPaise / 100).toFixed(0)} / player`}
            />
          </div>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-muted-foreground">Session fill progress</span>
              <strong>{Math.round(percent)}%</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border bg-muted/30 p-5">
          <SessionParticipants
            participants={session.participants}
            maximumPlayers={session.maximumPlayers}
          />
        </div>
      )}
    </article>
  );
}
function Detail({ icon: Icon, value }: { icon: typeof CalendarDays; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span>{value}</span>
    </div>
  );
}
function StatusBadge({ status }: { status: OpenSessionStatus }) {
  const variant =
    status === 'open' || status === 'full' || status === 'confirmed'
      ? 'success'
      : status === 'cancelled'
        ? 'destructive'
        : status === 'completed'
          ? 'outline'
          : 'warning';
  return (
    <Badge variant={variant} className="capitalize">
      {status.replaceAll('_', ' ')}
    </Badge>
  );
}
