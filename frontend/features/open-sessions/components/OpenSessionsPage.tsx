'use client';
import { useEffect, useState } from 'react';
import type { CatalogItem, OpenSessionDTO } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Button, Heading, Select, Spinner, useToast } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { listPublicSportsTypes } from '@/features/turf-onboarding/actions/catalogApi';
import { listOpenSessions } from '../actions/openSessionApi';
import { OpenSessionCard } from './OpenSessionCard';

export function OpenSessionsPage() {
  const { user, clearUser } = useCurrentUser();
  const [items, setItems] = useState<OpenSessionDTO[]>([]);
  const [sports, setSports] = useState<CatalogItem[]>([]);
  const [sportTypeId, setSportTypeId] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  useEffect(() => { void listPublicSportsTypes().then((result) => setSports(result.items)); }, []);
  useEffect(() => {
    void listOpenSessions({ page, limit: 9, ...(sportTypeId ? { sportTypeId } : {}), ...(location ?? {}) })
      .then((result) => { setItems(result.items); setTotalPages(result.pagination.totalPages); })
      .catch(() => showToast('Unable to load open sessions.', 'error')).finally(() => setLoading(false));
  }, [location, page, showToast, sportTypeId]);
  const toggleNearMe = () => {
    setLoading(true);
    if (location) return setLocation(undefined);
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => { setLoading(false); showToast('Allow location access to find nearby sessions.', 'error'); },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };
  return <><Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} /><main className="mx-auto max-w-7xl px-4 py-8">
    <Heading variant="h1">Open Sessions</Heading><p className="mt-2 text-muted-foreground">Find a game, pay your share, and join other players.</p>
    <div className="mt-6 flex flex-wrap gap-3"><div className="min-w-52"><Select value={sportTypeId} onChange={(event) => { setLoading(true); setSportTypeId(event.target.value); setPage(1); }} options={[{ label: 'All sports', value: '' }, ...sports.map((sport) => ({ label: sport.name, value: sport.id }))]} /></div><Button variant={location ? 'primary' : 'outline'} onClick={toggleNearMe}>{location ? 'Near me on' : 'Near me'}</Button></div>
    {loading ? <div className="flex min-h-64 items-center justify-center"><Spinner /></div> : <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((session) => <OpenSessionCard key={session.id} session={session} />)}</div>}
    {!loading && !items.length && <p className="mt-10 text-center text-muted-foreground">No open sessions match these filters.</p>}
    <div className="mt-8 flex justify-center gap-3"><Button variant="outline" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>Previous</Button><span className="self-center text-sm">Page {page} of {totalPages}</span><Button variant="outline" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>Next</Button></div>
  </main></>;
}
