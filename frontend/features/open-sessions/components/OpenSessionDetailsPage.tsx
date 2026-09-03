'use client';
import { useEffect, useState } from 'react';
import type { OpenSessionDTO } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Badge, Button, Card, CardContent, Heading, Spinner, useToast } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { submitPaymentForm } from '@/features/bookings/actions/bookingApi';
import { getOpenSession, joinOpenSession } from '../actions/openSessionApi';

const remaining = (deadline: string) => {
  const seconds = Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
  const days = Math.floor(seconds / 86400); const hours = Math.floor((seconds % 86400) / 3600); const minutes = Math.floor((seconds % 3600) / 60); const secs = seconds % 60;
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
};
export function OpenSessionDetailsPage({ id }: { id: string }) {
  const { user, clearUser } = useCurrentUser(); const { showToast } = useToast();
  const [session, setSession] = useState<OpenSessionDTO>(); const [timer, setTimer] = useState(''); const [joining, setJoining] = useState(false);
  useEffect(() => { void getOpenSession(id).then(setSession).catch(() => showToast('Unable to load open session.', 'error')); }, [id, showToast]);
  useEffect(() => { if (!session) return; const tick = () => setTimer(remaining(session.fillDeadline)); tick(); const handle = setInterval(tick, 1000); return () => clearInterval(handle); }, [session]);
  const join = async () => { setJoining(true); try { const result = await joinOpenSession(id); submitPaymentForm(result.payment); } catch { showToast('Unable to join this session.', 'error'); setJoining(false); } };
  if (!session) return <div className="flex min-h-64 items-center justify-center"><Spinner /></div>;
  const alreadyJoined = session.participants.some((participant) => participant.userId === user?.id && participant.paymentStatus === 'paid');
  return <><Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} /><main className="mx-auto max-w-4xl px-4 py-8"><Heading variant="h1">{session.sportName} at {session.turfName}</Heading><p className="mt-2 text-muted-foreground">{session.courtName} · {session.address}</p>
    <div className="mt-6 grid gap-5 md:grid-cols-2"><Card><CardContent className="space-y-3 py-5">{session.courtImage && <img src={session.courtImage} alt={session.courtName} className="h-56 w-full rounded-lg object-cover" />}<p><strong>Date:</strong> {new Date(`${session.bookingDate}T00:00:00`).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p><p><strong>Time:</strong> {session.startTime} - {session.endTime}</p><p><strong>Players:</strong> {session.joinedPlayers}/{session.maximumPlayers} joined (court minimum {session.minimumPlayers})</p><p><strong>Per head:</strong> ₹{(session.pricePerParticipantPaise / 100).toFixed(2)}</p></CardContent></Card>
      <Card><CardContent className="space-y-4 py-5"><Badge variant={session.status === 'open' ? 'success' : 'outline'}>{session.status}</Badge><div><p className="text-sm text-muted-foreground">Time remaining to fill</p><p className="mt-1 text-3xl font-bold tabular-nums">{timer}</p><p className="mt-2 text-xs text-muted-foreground">If all {session.maximumPlayers} places are not paid before this timer ends, the session is cancelled and paid shares are refunded.</p></div><div>{session.participants.filter((participant) => participant.paymentStatus === 'paid').map((participant) => <p key={participant.userId} className="border-t py-2 text-sm">{participant.name}{participant.isCreator ? ' (creator)' : ''}</p>)}</div><Button className="w-full" loading={joining} disabled={session.status !== 'open' || alreadyJoined} onClick={() => void join()}>{alreadyJoined ? 'Already joined' : 'Join and pay share'}</Button></CardContent></Card>
    </div></main></>;
}
