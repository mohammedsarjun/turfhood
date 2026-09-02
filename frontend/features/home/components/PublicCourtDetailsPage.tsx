'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ImageIcon, Users } from 'lucide-react';
import type { PublicCourtSlotDTO, SlotPeriod } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Spinner } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatTime12Hour } from '@/lib/time';
import { usePublicCourtDetails } from '../hooks/usePublicCourtDetails';

const PERIODS: Array<{ key: SlotPeriod; label: string }> = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
  { key: 'night', label: 'Night' },
];

export function PublicCourtDetailsPage({ turfId, courtId }: { turfId: string; courtId: string }) {
  const { user, clearUser } = useCurrentUser();
  const { details, loading, error } = usePublicCourtDetails(turfId, courtId);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(() => new Set());
  const dates = details?.dates ?? [];
  const dateAvailability = dates[selectedDate];
  const groups = useMemo(
    () => new Map(PERIODS.map(({ key }) => [key, dateAvailability?.slots.filter((slot) => slot.period === key) ?? []])),
    [dateAvailability],
  );

  const toggleSlot = (slot: PublicCourtSlotDTO) => {
    setSelectedSlots((current) => {
      const next = new Set(current);
      if (next.has(slot.id)) next.delete(slot.id);
      else next.add(slot.id);
      return next;
    });
  };

  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? <div className="flex min-h-96 items-center justify-center"><Spinner /></div> : !details ? (
          <p role="alert" className="rounded-xl border border-border p-8 text-destructive">{error}</p>
        ) : (
          <>
            <Link href={`/turfs/${turfId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to {details.turf.name}
            </Link>
            <section className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
              <div className="h-72 overflow-hidden rounded-2xl bg-muted sm:h-96">
                {details.court.images?.[0] ? <img src={details.court.images[0]} alt={details.court.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-12 w-12 text-muted-foreground" /></div>}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">{details.turf.name}</p>
                <h1 className="mt-1 text-3xl font-bold">{details.court.name}</h1>
                <p className="mt-4 flex items-center gap-2 text-muted-foreground"><Users className="h-5 w-5" /> Up to {details.court.capacity} players · {details.court.slotDurationMinutes} minute slots</p>
                <div className="mt-4 flex flex-wrap gap-2">{details.court.sports.map((sport) => <span key={sport} className="rounded-full bg-muted px-3 py-1.5 text-sm">{sport}</span>)}</div>
                {details.court.startingPricePerSlot !== undefined && <p className="mt-6 text-muted-foreground">Starting from <strong className="text-2xl text-foreground">₹{details.court.startingPricePerSlot.toLocaleString('en-IN')}</strong> / slot</p>}
              </div>
            </section>
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Choose a slot</h2>
              <p className="mt-1 text-sm text-muted-foreground">Availability for the next 14 days</p>
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                {dates.map((item, index) => {
                  const date = new Date(`${item.date}T00:00:00`);
                  return <button key={item.date} type="button" onClick={() => setSelectedDate(index)} className={`min-w-24 rounded-xl border px-4 py-3 text-center ${selectedDate === index ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary'}`}><span className="block text-xs font-medium">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span><span className="mt-1 block font-semibold">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></button>;
                })}
              </div>
              {!dateAvailability?.slots.length ? <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">{dateAvailability?.isClosed ? 'This court is closed on this date.' : 'No slots are available on this date.'}</p> : (
                <div className="mt-7 space-y-8">{PERIODS.map(({ key, label }) => { const slots = groups.get(key) ?? []; return slots.length ? <div key={key}><h3 className="mb-3 text-lg font-semibold">{label}</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{slots.map((slot) => { const selected = selectedSlots.has(slot.id); return <button key={slot.id} type="button" aria-pressed={selected} onClick={() => toggleSlot(slot)} className={`relative rounded-xl border p-4 text-left transition ${selected ? 'border-primary bg-success ring-1 ring-primary' : 'border-border bg-card hover:border-primary'}`}>{selected && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}<span className="block font-semibold">{formatTime12Hour(slot.startTime)}</span><span className="mt-1 block text-xs text-muted-foreground">to {formatTime12Hour(slot.endTime)}</span><span className="mt-3 block font-semibold text-primary">₹{slot.price.toLocaleString('en-IN')}</span></button>; })}</div></div> : null; })}</div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
