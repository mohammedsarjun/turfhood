'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, ImageIcon, Users } from 'lucide-react';
import type { PublicCourtSlotDTO, SlotPeriod } from '@turfhood/shared';
import { Header } from '@/components/shared';
import { Button, Input, Modal, Select, Spinner, useToast } from '@/components/ui';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatTime12Hour } from '@/lib/time';
import { usePublicCourtDetails } from '../hooks/usePublicCourtDetails';
import {
  abandonBookingCheckout,
  createReservation,
  submitPaymentForm,
} from '@/features/bookings/actions/bookingApi';
import { ApiError } from '@/types/api/response';
import { createOpenSession } from '@/features/open-sessions/actions/openSessionApi';

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
  const [reserving, setReserving] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [openSessionOpen, setOpenSessionOpen] = useState(false);
  const [sessionSportId, setSessionSportId] = useState('');
  const [maximumPlayers, setMaximumPlayers] = useState('');
  const { showToast } = useToast();
  const dates = details?.dates ?? [];
  const dateAvailability = dates[selectedDate];
  const groups = useMemo(
    () =>
      new Map(
        PERIODS.map(({ key }) => [
          key,
          dateAvailability?.slots.filter((slot) => slot.period === key) ?? [],
        ]),
      ),
    [dateAvailability],
  );

  const toggleSlot = (slot: PublicCourtSlotDTO) => {
    if (!slot.available) return;
    setSelectedSlots((current) => {
      const next = new Set(current);
      if (next.has(slot.id)) next.delete(slot.id);
      else next.add(slot.id);
      return next;
    });
  };
  const selectedForDate =
    dateAvailability?.slots.filter((slot) => selectedSlots.has(slot.id)) ?? [];
  const total = selectedForDate.reduce((sum, slot) => sum + slot.price, 0);
  const proceed = async () => {
    if (!dateAvailability || !selectedForDate.length) return;
    setReserving(true);
    let reservationId: string | undefined;
    try {
      const result = await createReservation({
        turfId,
        courtId,
        bookingDate: dateAvailability.date,
        slots: selectedForDate.map(({ startTime, endTime }) => ({ startTime, endTime })),
      });
      reservationId = result.booking.id;
      submitPaymentForm(result.payment);
    } catch (caught) {
      if (reservationId) {
        try {
          await abandonBookingCheckout(reservationId);
        } catch {
          showToast('Checkout failed; the temporary slot hold will expire shortly.', 'error');
        }
      }
      showToast(
        caught instanceof ApiError ? caught.message : 'Unable to reserve these slots.',
        'error',
      );
      setReserving(false);
    }
  };
  const createSession = async () => {
    const slot = selectedForDate[0];
    if (!dateAvailability || !slot || selectedForDate.length !== 1) {
      showToast('Select exactly one slot for an open session.', 'error');
      return;
    }
    setReserving(true);
    try {
      const result = await createOpenSession({
        turfId,
        courtId,
        sportTypeId: sessionSportId,
        bookingDate: dateAvailability.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maximumPlayers: Number(maximumPlayers),
      });
      submitPaymentForm(result.payment);
    } catch (caught) {
      showToast(
        caught instanceof ApiError ? caught.message : 'Unable to create open session.',
        'error',
      );
      setReserving(false);
    }
  };

  return (
    <>
      <Header userName={user?.name} avatarUrl={user?.avatarUrl} onLoggedOut={clearUser} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex min-h-96 items-center justify-center">
            <Spinner />
          </div>
        ) : !details ? (
          <p role="alert" className="rounded-xl border border-border p-8 text-destructive">
            {error}
          </p>
        ) : (
          <>
            <Link
              href={`/turfs/${turfId}`}
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to {details.turf.name}
            </Link>
            <section className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
              <div className="relative h-72 overflow-hidden rounded-2xl bg-muted sm:h-96">
                {details.court.images?.[0] ? (
                  <Image
                    src={details.court.images[0]}
                    alt={details.court.name}
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 57vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-primary">{details.turf.name}</p>
                <h1 className="mt-1 text-3xl font-bold">{details.court.name}</h1>
                <p className="mt-4 flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" /> Up to {details.court.capacity} players ·{' '}
                  {details.court.slotDurationMinutes} minute slots
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {details.court.sports.map((sport) => (
                    <span key={sport} className="rounded-full bg-muted px-3 py-1.5 text-sm">
                      {sport}
                    </span>
                  ))}
                </div>
                {details.court.startingPricePerSlot !== undefined && (
                  <p className="mt-6 text-muted-foreground">
                    Starting from{' '}
                    <strong className="text-2xl text-foreground">
                      ₹{details.court.startingPricePerSlot.toLocaleString('en-IN')}
                    </strong>{' '}
                    / slot
                  </p>
                )}
              </div>
            </section>
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Choose a slot</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Availability for the next 14 days
              </p>
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                {dates.map((item, index) => {
                  const date = new Date(`${item.date}T00:00:00`);
                  return (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(index);
                        setSelectedSlots(new Set());
                      }}
                      className={`min-w-24 rounded-xl border px-4 py-3 text-center ${selectedDate === index ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary'}`}
                    >
                      <span className="block text-xs font-medium">
                        {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                      <span className="mt-1 block font-semibold">
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!dateAvailability?.slots.length ? (
                <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  {dateAvailability?.isClosed
                    ? 'This court is closed on this date.'
                    : 'No slots are available on this date.'}
                </p>
              ) : (
                <div className="mt-7 space-y-8">
                  {PERIODS.map(({ key, label }) => {
                    const slots = groups.get(key) ?? [];
                    return slots.length ? (
                      <div key={key}>
                        <h3 className="mb-3 text-lg font-semibold">{label}</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                          {slots.map((slot) => {
                            const selected = selectedSlots.has(slot.id);
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                aria-pressed={selected}
                                disabled={!slot.available}
                                onClick={() => toggleSlot(slot)}
                                className={`relative rounded-xl border p-4 text-left transition ${!slot.available ? 'cursor-not-allowed border-border bg-muted opacity-60' : selected ? 'border-primary bg-success ring-1 ring-primary' : 'border-border bg-card hover:border-primary'}`}
                              >
                                {selected && (
                                  <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />
                                )}
                                <span className="block font-semibold">
                                  {formatTime12Hour(slot.startTime)}
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">
                                  to {formatTime12Hour(slot.endTime)}
                                </span>
                                <span className="mt-3 block font-semibold text-primary">
                                  ₹{slot.price.toLocaleString('en-IN')}
                                </span>
                                {!slot.available && (
                                  <span className="mt-2 block text-xs font-medium capitalize text-destructive">
                                    {slot.unavailableReason === 'booked'
                                      ? 'Booked'
                                      : slot.unavailableReason === 'reserved'
                                        ? 'Temporarily held'
                                        : slot.unavailableReason}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              {selectedForDate.length > 0 && (
                <div className="sticky bottom-4 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-card p-4 shadow-xl">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedForDate.length} slot{selectedForDate.length === 1 ? '' : 's'}{' '}
                      selected
                    </p>
                    <p className="text-xl font-bold">₹{total.toLocaleString('en-IN')}</p>
                  </div>
                  <Button onClick={() => setReviewOpen(true)}>Review booking</Button>
                </div>
              )}
            </section>
            <Modal
              open={reviewOpen}
              onClose={() => setReviewOpen(false)}
              title="Review your booking"
            >
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold">
                    {details.turf.name} · {details.court.name}
                  </p>
                  <p className="text-muted-foreground">
                    {dateAvailability
                      ? new Date(`${dateAvailability.date}T00:00:00`).toLocaleDateString('en-IN', {
                          dateStyle: 'full',
                        })
                      : ''}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  {selectedForDate.map((slot) => (
                    <div key={slot.id} className="flex justify-between py-1">
                      <span>
                        {formatTime12Hour(slot.startTime)}–{formatTime12Hour(slot.endTime)}
                      </span>
                      <span>₹{slot.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
                    <span>Total payable</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                  <strong className="text-foreground">Cancellation policy:</strong> full refund
                  within 10 minutes of confirmation or at least 24 hours before play; 50% refund
                  from 6–24 hours; no refund within 6 hours.
                </div>
                <p className="text-xs text-muted-foreground">
                  Slots are held for 10 minutes after you continue to PayU.
                </p>
                <Button className="w-full" loading={reserving} onClick={() => void proceed()}>
                  Continue to PayU
                </Button>
                {details.court.allowOpenSessions && (
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={selectedForDate.length !== 1}
                    onClick={() => {
                      setReviewOpen(false);
                      setSessionSportId(details.openSessionPolicy?.sportOptions[0]?.id ?? '');
                      setMaximumPlayers(String(details.openSessionPolicy?.minimumPlayers ?? ''));
                      setOpenSessionOpen(true);
                    }}
                  >
                    Create open session
                  </Button>
                )}
              </div>
            </Modal>
            <Modal
              open={openSessionOpen}
              onClose={() => setOpenSessionOpen(false)}
              title="Create open session"
              className="max-w-lg rounded-2xl p-5 sm:p-6"
            >
              <div className="space-y-5">
                <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                  You pay one equal share now. The slot must be at least 48 hours away and every
                  place must be filled before the cutoff.
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="open-session-sport" className="mb-2 block text-sm font-medium">
                      Sport
                    </label>
                    <Select
                      id="open-session-sport"
                      value={sessionSportId}
                      onChange={(event) => setSessionSportId(event.target.value)}
                      options={(details.openSessionPolicy?.sportOptions ?? []).map((sport) => ({
                        label: sport.name,
                        value: sport.id,
                      }))}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="open-session-players"
                      className="mb-2 block text-sm font-medium"
                    >
                      Maximum players
                    </label>
                    <Input
                      id="open-session-players"
                      type="number"
                      min={details.openSessionPolicy?.minimumPlayers ?? 1}
                      max={details.court.capacity}
                      value={maximumPlayers}
                      onChange={(event) => setMaximumPlayers(event.target.value)}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Allowed: {details.openSessionPolicy?.minimumPlayers ?? 1}–
                      {details.court.capacity} players
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p>Total court price: ₹{total.toFixed(2)}</p>
                  <p className="mt-1 font-semibold">
                    Per participant: ₹
                    {maximumPlayers && Number(maximumPlayers) > 0
                      ? Math.ceil((total * 100) / Number(maximumPlayers)) / 100
                      : 0}
                  </p>
                </div>
                <Button
                  className="h-12 w-full text-base"
                  loading={reserving}
                  disabled={!sessionSportId || !maximumPlayers}
                  onClick={() => void createSession()}
                >
                  Pay my share and create
                </Button>
              </div>
            </Modal>
          </>
        )}
      </main>
    </>
  );
}
