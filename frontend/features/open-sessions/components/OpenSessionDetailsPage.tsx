'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPin,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { OpenSessionDTO } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Badge, Button, Card, CardContent, Modal, Spinner, useToast } from '@/components/ui';
import { submitPaymentForm } from '@/features/bookings/actions/bookingApi';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatTime12Hour } from '@/lib/time';
import {
  cancelOpenSessionParticipation,
  getOpenSession,
  joinOpenSession,
} from '../actions/openSessionApi';
import { SessionParticipants } from './SessionParticipants';

const remaining = (deadline: string) => {
  const seconds = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m ${seconds % 60}s`;
};

export function OpenSessionDetailsPage({ id }: { id: string }) {
  const { user, clearUser } = useCurrentUser();
  const { showToast } = useToast();
  const [session, setSession] = useState<OpenSessionDTO>();
  const [timer, setTimer] = useState('');
  const [joining, setJoining] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    void getOpenSession(id)
      .then(setSession)
      .catch(() => {
        setLoadFailed(true);
        showToast('Unable to load open session.', 'error');
      });
  }, [id, showToast]);
  useEffect(() => {
    if (!session) return;
    const tick = () => setTimer(remaining(session.fillDeadline));
    tick();
    const handle = setInterval(tick, 1000);
    return () => clearInterval(handle);
  }, [session]);
  const join = async () => {
    setJoining(true);
    try {
      const result = await joinOpenSession(id);
      submitPaymentForm(result.payment);
    } catch {
      showToast('Unable to join this session.', 'error');
      setJoining(false);
    }
  };
  const cancelParticipation = async () => {
    setCancelling(true);
    try {
      setSession(await cancelOpenSessionParticipation(id));
      setCancelConfirmationOpen(false);
      showToast('Your place was cancelled. A full refund has been requested.');
    } catch {
      showToast('Unable to cancel your place.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!session)
    return (
      <>
        <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
        <main className="mx-auto flex min-h-80 max-w-6xl items-center justify-center px-4">
          {loadFailed ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="font-semibold">This open session could not be loaded.</p>
              <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          ) : (
            <Spinner />
          )}
        </main>
      </>
    );

  const alreadyJoined = session.participants.some(
    (participant) => participant.userId === user?.id && participant.paymentStatus === 'paid',
  );
  const spotsLeft = Math.max(0, session.maximumPlayers - session.joinedPlayers);
  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/open-sessions"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Open sessions
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="truncate font-medium text-foreground">{session.sportName}</span>
        </nav>
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative min-h-64 bg-muted sm:min-h-80">
            {session.courtImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote court image URL
              <img
                src={session.courtImage}
                alt={session.courtName}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <UsersRound className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge
                  variant={session.status === 'open' ? 'success' : 'outline'}
                  className="capitalize"
                >
                  {session.status.replaceAll('_', ' ')}
                </Badge>
                <Badge className="bg-white/20 text-white backdrop-blur-sm">
                  {session.sportName}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold sm:text-4xl">{session.turfName}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/80 sm:text-base">
                <MapPin className="h-4 w-4 shrink-0" /> {session.courtName} · {session.address}
              </p>
            </div>
          </div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="space-y-6">
            <Card>
              <CardContent className="grid gap-5 py-6 sm:grid-cols-2">
                <SessionDetail
                  icon={CalendarDays}
                  label="Date"
                  value={new Date(`${session.bookingDate}T00:00:00`).toLocaleDateString('en-IN', {
                    dateStyle: 'long',
                  })}
                />
                <SessionDetail
                  icon={Clock3}
                  label="Time"
                  value={`${formatTime12Hour(session.startTime)} - ${formatTime12Hour(session.endTime)}`}
                />
                <SessionDetail
                  icon={UsersRound}
                  label="Players"
                  value={`${session.joinedPlayers}/${session.maximumPlayers} joined · ${spotsLeft} spots left`}
                />
                <SessionDetail
                  icon={IndianRupee}
                  label="Your share"
                  value={`₹${(session.pricePerParticipantPaise / 100).toFixed(2)} per player`}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <SessionParticipants
                  participants={session.participants}
                  currentUserId={user?.id}
                  maximumPlayers={session.maximumPlayers}
                />
              </CardContent>
            </Card>
          </div>
          <aside>
            <Card className="sticky top-24 overflow-hidden border-primary/20">
              <CardContent className="space-y-5 py-6">
                <div className="rounded-2xl bg-primary/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Clock3 className="h-4 w-4" /> Time remaining to fill
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{timer}</p>
                </div>
                <div className="flex gap-3 rounded-xl border border-border p-4 text-sm text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p>
                    All {session.maximumPlayers} places must be paid before the timer ends. If the
                    session does not fill, paid shares are refunded.
                  </p>
                </div>
                <Button
                  className="h-12 w-full text-base"
                  loading={joining}
                  disabled={session.status !== 'open' || alreadyJoined}
                  onClick={() => void join()}
                >
                  {alreadyJoined
                    ? 'You are already in this session'
                    : `Join for ₹${(session.pricePerParticipantPaise / 100).toFixed(2)}`}
                </Button>
                {alreadyJoined && session.status !== 'confirmed' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    loading={cancelling}
                    onClick={() => setCancelConfirmationOpen(true)}
                  >
                    Cancel place and get full refund
                  </Button>
                )}
                <p className="text-center text-xs text-muted-foreground">
                  All {session.maximumPlayers} paid players are required for confirmation
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
        <Modal
          open={cancelConfirmationOpen}
          onClose={() => setCancelConfirmationOpen(false)}
          title="Cancel your open-session place?"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your place becomes available to another player and a full refund of ₹
              {(session.pricePerParticipantPaise / 100).toFixed(2)} will be requested. You can join
              again later if a place is still available.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelConfirmationOpen(false)}>
                Keep my place
              </Button>
              <Button
                variant="destructive"
                loading={cancelling}
                onClick={() => void cancelParticipation()}
              >
                Cancel and refund
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </>
  );
}

function SessionDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold sm:text-base">{value}</p>
      </div>
    </div>
  );
}
