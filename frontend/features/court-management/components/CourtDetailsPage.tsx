'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock3, Pencil, Plus, Trash2, Users } from 'lucide-react';
import type {
  AvailabilityOverrideDTO,
  AvailabilityOverrideReasonType,
  BlockedSlotDTO,
  CourtDetailsResponse,
  CreateAvailabilityOverrideRequest,
  CourtDTO,
} from '@turfhood/shared';
import { createAvailabilityOverrideSchema } from '@turfhood/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Modal,
  Select,
  Spinner,
  useToast,
} from '@/components/ui';
import { ApiError } from '@/types/api/response';
import {
  createAvailabilityOverride,
  deleteAvailabilityOverride,
  getCourtDetails,
  updateAvailabilityOverride,
} from '../actions/courtApi';
import { CourtFormModal } from './CourtFormModal';
import { formatTime12Hour } from '@/lib/time';
import { getPublicCourtDetails } from '@/features/home/actions/homeApi';

const reasonLabels: Record<AvailabilityOverrideReasonType, string> = {
  holiday: 'Holiday',
  maintenance: 'Maintenance',
  private_event: 'Private event',
  weather: 'Weather',
  other: 'Other',
};

interface Props {
  turfId: string;
  courtId: string;
}

export function CourtDetailsPage({ turfId, courtId }: Props) {
  const [details, setDetails] = useState<CourtDetailsResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<AvailabilityOverrideDTO | null>(null);
  const [overrideToDelete, setOverrideToDelete] = useState<AvailabilityOverrideDTO | null>(null);
  const [isDeletingOverride, setIsDeletingOverride] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDetails(await getCourtDetails(turfId, courtId));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Failed to load court details.');
    } finally {
      setLoading(false);
    }
  }, [courtId, turfId]);

  useEffect(() => {
    let active = true;
    void getCourtDetails(turfId, courtId)
      .then((result) => {
        if (active) setDetails(result);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof ApiError ? caught.message : 'Failed to load court details.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courtId, turfId]);

  const removeOverride = useCallback(async () => {
    if (!overrideToDelete) return;
    setIsDeletingOverride(true);
    try {
      await deleteAvailabilityOverride(turfId, courtId, overrideToDelete.id);
      setDetails((current) =>
        current
          ? {
              ...current,
              availabilityOverrides: current.availabilityOverrides.filter(
                (entry) => entry.id !== overrideToDelete.id,
              ),
            }
          : current,
      );
      showToast('Availability override removed.', 'success');
      setOverrideToDelete(null);
    } catch (caught) {
      showToast(
        caught instanceof ApiError ? caught.message : 'Failed to remove override.',
        'error',
      );
    } finally {
      setIsDeletingOverride(false);
    }
  }, [courtId, overrideToDelete, showToast, turfId]);

  if (loading)
    return (
      <div className="flex min-h-72 items-center justify-center">
        <Spinner />
      </div>
    );
  if (!details)
    return (
      <div>
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
        <Button variant="outline" onClick={() => void load()}>
          Try again
        </Button>
      </div>
    );

  const { court, availabilityOverrides } = details;
  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/turf-portal/${turfId}/courts`}
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to courts
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Heading variant="h1">{court.name}</Heading>
            <p className="mt-1 text-sm text-muted-foreground">
              Court details and special availability
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={court.status === 'active' ? 'success' : 'outline'}>
              {court.status}
            </Badge>
            <Button variant="outline" onClick={() => setEditModalOpen(true)}>
              <Pencil size={16} /> Edit court
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Card className="overflow-hidden">
          <CourtGallery court={court} />
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
            <CourtStat
              icon={<Users size={18} />}
              label="Capacity"
              value={`${court.capacity} players`}
            />
            <CourtStat
              icon={<Clock3 size={18} />}
              label="Slot duration"
              value={`${court.slotDurationMinutes} min`}
            />
            <CourtStat
              icon={<CalendarDays size={18} />}
              label="Open sessions"
              value={
                court.allowOpenSessions
                  ? `From ${court.minPlayersForOpenSession} players`
                  : 'Disabled'
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pricing schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {court.pricingRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-lg bg-muted p-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize">{rule.dayType}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime12Hour(rule.startTime)} - {formatTime12Hour(rule.endTime)}
                  </p>
                </div>
                <p className="font-semibold">
                  ₹{rule.pricePerSlot}
                  <span className="text-xs font-normal text-muted-foreground"> / slot</span>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Availability overrides</CardTitle>
            <p className="text-sm text-muted-foreground">
              Close the court for a day or block individual bookable slots.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingOverride(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> Add override
          </Button>
        </CardHeader>
        <CardContent>
          {availabilityOverrides.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <CalendarDays className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">All configured slots are available</p>
              <p className="text-sm text-muted-foreground">
                This court follows its regular schedule.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {availabilityOverrides.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">
                          {new Date(`${item.date}T00:00:00`).toLocaleDateString('en-IN', {
                            dateStyle: 'medium',
                          })}
                        </p>
                        <Badge variant={item.isClosed ? 'destructive' : 'warning'}>
                          {item.isClosed
                            ? 'Closed all day'
                            : `${item.blockedSlots.length} blocked slot${item.blockedSlots.length === 1 ? '' : 's'}`}
                        </Badge>
                      </div>
                      {item.isClosed ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.closureReason
                            ? reasonLabels[item.closureReason]
                            : 'Court unavailable for the day'}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.blockedSlots
                            .map((slot) => formatTime12Hour(slot.startTime))
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit override for ${item.date}`}
                      onClick={() => {
                        setEditingOverride(item);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove override for ${item.date}`}
                      onClick={() => setOverrideToDelete(item)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <OverrideModal
        key={editingOverride?.id ?? 'new-override'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editingOverride}
        onSaved={(item) => {
          setDetails((current) =>
            current
              ? {
                  ...current,
                  availabilityOverrides: [
                    ...current.availabilityOverrides.filter((entry) => entry.id !== item.id),
                    item,
                  ].sort((a, b) => a.date.localeCompare(b.date)),
                }
              : current,
          );
          setModalOpen(false);
        }}
        turfId={turfId}
        courtId={courtId}
        court={court}
      />
      <Modal
        open={overrideToDelete !== null}
        onClose={() => {
          if (!isDeletingOverride) setOverrideToDelete(null);
        }}
        title="Delete availability override?"
      >
        <p className="text-sm text-muted-foreground">
          This will restore the regular schedule for{' '}
          <span className="font-medium text-foreground">
            {overrideToDelete
              ? new Date(`${overrideToDelete.date}T00:00:00`).toLocaleDateString('en-IN', {
                  dateStyle: 'medium',
                })
              : ''}
          </span>
          . This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeletingOverride}
            onClick={() => setOverrideToDelete(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isDeletingOverride}
            onClick={() => void removeOverride()}
          >
            Delete override
          </Button>
        </div>
      </Modal>
      <CourtFormModal
        key={court.updatedAt}
        turfId={turfId}
        court={court}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onCreated={() => undefined}
        onUpdated={(updatedCourt) => {
          setDetails((current) => (current ? { ...current, court: updatedCourt } : current));
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}

function CourtGallery({ court }: { court: CourtDTO }) {
  const initial = court.images.find((image) => image.isCover) ?? court.images[0];
  const [selectedId, setSelectedId] = useState(initial?.id ?? '');
  const selected = court.images.find((image) => image.id === selectedId) ?? initial;

  if (!selected) {
    return (
      <div className="flex h-64 items-center justify-center bg-muted text-muted-foreground">
        No court image
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- owner-hosted court image */}
      <img
        src={selected.url}
        alt={`${court.name} view`}
        className="h-72 w-full rounded-lg object-cover"
      />
      {court.images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {court.images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show court image ${index + 1}`}
              aria-pressed={image.id === selected.id}
              onClick={() => setSelectedId(image.id)}
              className={`shrink-0 overflow-hidden rounded-md border-2 transition ${image.id === selected.id ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- owner-hosted court image */}
              <img src={image.url} alt="" className="h-16 w-24 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CourtStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function OverrideModal({
  open,
  onClose,
  onSaved,
  turfId,
  courtId,
  court,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (item: AvailabilityOverrideDTO) => void;
  turfId: string;
  courtId: string;
  court: CourtDTO;
  initial: AvailabilityOverrideDTO | null;
}) {
  type ScheduleMode = 'slots' | 'closed';
  const [mode, setMode] = useState<ScheduleMode>(initial?.isClosed ? 'closed' : 'slots');
  const [closureReason, setClosureReason] = useState<AvailabilityOverrideReasonType>(
    initial?.closureReason ?? 'holiday',
  );
  const [date, setDate] = useState(initial?.date ?? '');
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlotDTO[]>(initial?.blockedSlots ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(() => new Set());
  const { showToast } = useToast();
  const minDate = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  const maxDate = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 13);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }, []);
  const slots = useMemo(() => getCourtSlotsForDate(court, date), [court, date]);
  const selected = useMemo(() => new Set(blockedSlots.map(slotKey)), [blockedSlots]);
  useEffect(() => {
    if (!date) return;
    let active = true;
    void getPublicCourtDetails(turfId, courtId)
      .then((details) => {
        if (!active) return;
        const selectedDate = details.dates.find((item) => item.date === date);
        setOccupiedSlots(
          new Set(
            (selectedDate?.slots ?? [])
              .filter(
                (slot) =>
                  slot.unavailableReason === 'booked' || slot.unavailableReason === 'reserved',
              )
              .map((slot) => slot.startTime),
          ),
        );
      })
      .catch(() => {
        if (active) setError('Unable to check existing bookings for this date.');
      });
    return () => {
      active = false;
    };
  }, [courtId, date, turfId]);
  const toggleSlot = (slot: OwnerSlot) => {
    if (occupiedSlots.has(slot.startTime)) return;
    const key = slotKey(slot);
    setBlockedSlots((current) =>
      selected.has(key)
        ? current.filter((item) => slotKey(item) !== key)
        : [...current, { startTime: slot.startTime, endTime: slot.endTime }],
    );
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload: CreateAvailabilityOverrideRequest = {
      date,
      isClosed: mode === 'closed',
      ...(mode === 'closed' ? { closureReason } : {}),
      blockedSlots: mode === 'closed' ? [] : blockedSlots,
    };
    const result = createAvailabilityOverrideSchema.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Check the override details.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const item = initial
        ? await updateAvailabilityOverride(turfId, courtId, initial.id, result.data)
        : await createAvailabilityOverride(turfId, courtId, result.data);
      onSaved(item);
      showToast(initial ? 'Daily availability updated.' : 'Daily availability added.', 'success');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Failed to add override.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit daily availability' : 'Add daily availability'}
      className="max-h-[90vh] max-w-3xl overflow-y-auto"
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">
          Date
          <Input
            type="date"
            min={minDate}
            max={maxDate}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Schedule for this date
          <Select
            className="mt-2"
            value={mode}
            onChange={(event) => {
              const nextMode = event.target.value as ScheduleMode;
              if (nextMode === 'closed' && occupiedSlots.size > 0) {
                setError('This date has bookings. Cancel them before closing the full day.');
                return;
              }
              setError('');
              setMode(nextMode);
            }}
            options={[
              { value: 'slots', label: 'Block particular slots' },
              { value: 'closed', label: 'Closed for the entire day' },
            ]}
          />
        </label>
        {mode === 'closed' && (
          <label className="block text-sm font-medium">
            Closure reason
            <Select
              className="mt-2"
              value={closureReason}
              onChange={(event) =>
                setClosureReason(event.target.value as AvailabilityOverrideReasonType)
              }
              options={Object.entries(reasonLabels).map(([value, label]) => ({ value, label }))}
            />
          </label>
        )}
        {mode === 'slots' && date && (
          <fieldset className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <legend className="font-medium">Select slots to block</legend>
                <p className="text-xs text-muted-foreground">
                  Selected slots will not be available to customers.
                </p>
              </div>
              <Badge variant="warning">{blockedSlots.length} selected</Badge>
            </div>
            {slots.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {slots.map((slot) => {
                  const isSelected = selected.has(slotKey(slot));
                  const isOccupied = occupiedSlots.has(slot.startTime);
                  return (
                    <button
                      key={slotKey(slot)}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={isOccupied}
                      onClick={() => toggleSlot(slot)}
                      className={`rounded-xl border p-3 text-left transition ${isOccupied ? 'cursor-not-allowed bg-muted opacity-60' : isSelected ? 'border-destructive bg-destructive/10 ring-1 ring-destructive' : 'border-border bg-card hover:border-primary'}`}
                    >
                      <span className="block font-semibold">
                        {formatTime12Hour(slot.startTime)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        to {formatTime12Hour(slot.endTime)}
                      </span>
                      <span className="mt-2 block text-sm font-medium">
                        Rs. {slot.price.toLocaleString('en-IN')}
                      </span>
                      {isOccupied && (
                        <span className="mt-1 block text-xs font-semibold text-destructive">
                          Already booked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">
                No configured slots for this date.
              </p>
            )}
          </fieldset>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {initial ? 'Save changes' : 'Add daily availability'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface OwnerSlot extends BlockedSlotDTO {
  price: number;
}

function slotKey(slot: BlockedSlotDTO): string {
  return `${slot.startTime}-${slot.endTime}`;
}

function getCourtSlotsForDate(court: CourtDTO, date: string): OwnerSlot[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  const dayType = day === 0 || day === 6 ? 'weekend' : 'weekday';
  return court.pricingRules
    .filter((rule) => rule.dayType === dayType)
    .flatMap((rule) => {
      const [startHour = 0, startMinute = 0] = rule.startTime.split(':').map(Number);
      const [endHour = 0, endMinute = 0] = rule.endTime.split(':').map(Number);
      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;
      const slots: OwnerSlot[] = [];
      for (
        let minute = start;
        minute + court.slotDurationMinutes <= end;
        minute += court.slotDurationMinutes
      ) {
        const finish = minute + court.slotDurationMinutes;
        slots.push({
          startTime: `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`,
          endTime: `${String(Math.floor(finish / 60)).padStart(2, '0')}:${String(finish % 60).padStart(2, '0')}`,
          price: rule.pricePerSlot,
        });
      }
      return slots;
    })
    .sort((left, right) => left.startTime.localeCompare(right.startTime));
}
