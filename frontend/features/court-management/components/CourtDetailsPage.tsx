'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock3, Pencil, Plus, Trash2, Users } from 'lucide-react';
import type {
  AvailabilityOverrideDTO,
  AvailabilityOverrideReasonType,
  AvailabilityPeriodDTO,
  BlockedPeriodDTO,
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
  TimeInput,
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

const reasonLabels: Record<AvailabilityOverrideReasonType, string> = {
  holiday: 'Holiday', maintenance: 'Maintenance', private_event: 'Private event',
  weather: 'Weather', other: 'Other',
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

  const removeOverride = useCallback(
    async () => {
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
    },
    [courtId, overrideToDelete, showToast, turfId],
  );

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
            <Badge variant={court.status === 'active' ? 'success' : 'outline'}>{court.status}</Badge>
            <Button variant="outline" onClick={() => setEditModalOpen(true)}><Pencil size={16} /> Edit court</Button>
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
              Close or change this court&apos;s hours for a specific date.
            </p>
          </div>
          <Button onClick={() => { setEditingOverride(null); setModalOpen(true); }}>
            <Plus size={16} /> Add override
          </Button>
        </CardHeader>
        <CardContent>
          {availabilityOverrides.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <CalendarDays className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">No special availability</p>
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
                          {item.isClosed ? 'Closed all day' : item.customHours ? 'Custom schedule' : 'Regular hours'}
                        </Badge>
                      </div>
                      {item.isClosed ? (
                        <p className="mt-1 text-sm text-muted-foreground">{item.closureReason ? reasonLabels[item.closureReason] : 'Court unavailable for the day'}</p>
                      ) : (
                        <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                          <p>{item.customHours ? item.customHours.map((period) => `${formatTime12Hour(period.startTime)}–${formatTime12Hour(period.endTime)}`).join(', ') : 'Uses regular opening hours'}</p>
                          {item.blockedPeriods.length > 0 && <p>{item.blockedPeriods.length} blocked period{item.blockedPeriods.length === 1 ? '' : 's'}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" aria-label={`Edit override for ${item.date}`} onClick={() => { setEditingOverride(item); setModalOpen(true); }}><Pencil size={16} /></Button>
                    <Button variant="ghost" size="sm" aria-label={`Remove override for ${item.date}`} onClick={() => setOverrideToDelete(item)}><Trash2 size={16} className="text-destructive" /></Button>
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
      />
      <Modal
        open={overrideToDelete !== null}
        onClose={() => { if (!isDeletingOverride) setOverrideToDelete(null); }}
        title="Delete availability override?"
      >
        <p className="text-sm text-muted-foreground">
          This will restore the regular schedule for{' '}
          <span className="font-medium text-foreground">
            {overrideToDelete
              ? new Date(`${overrideToDelete.date}T00:00:00`).toLocaleDateString('en-IN', { dateStyle: 'medium' })
              : ''}
          </span>
          . This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={isDeletingOverride} onClick={() => setOverrideToDelete(null)}>Cancel</Button>
          <Button type="button" variant="destructive" loading={isDeletingOverride} onClick={() => void removeOverride()}>Delete override</Button>
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
          setDetails((current) => current ? { ...current, court: updatedCourt } : current);
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
    return <div className="flex h-64 items-center justify-center bg-muted text-muted-foreground">No court image</div>;
  }

  return (
    <div className="p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- owner-hosted court image */}
      <img src={selected.url} alt={`${court.name} view`} className="h-72 w-full rounded-lg object-cover" />
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
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (item: AvailabilityOverrideDTO) => void;
  turfId: string;
  courtId: string;
  initial: AvailabilityOverrideDTO | null;
}) {
  type ScheduleMode = 'regular' | 'custom' | 'closed';
  type ClientPeriod = AvailabilityPeriodDTO & { clientId: string };
  type ClientBlockedPeriod = BlockedPeriodDTO & { clientId: string };
  const makePeriod = (period: AvailabilityPeriodDTO = { startTime: '09:00', endTime: '18:00' }): ClientPeriod => ({ ...period, clientId: crypto.randomUUID() });
  const makeBlockedPeriod = (period: BlockedPeriodDTO = { startTime: '12:00', endTime: '13:00' }): ClientBlockedPeriod => ({ ...period, clientId: crypto.randomUUID() });
  const initialMode: ScheduleMode = initial?.isClosed ? 'closed' : initial?.customHours ? 'custom' : 'regular';
  const [mode, setMode] = useState<ScheduleMode>(initialMode);
  const [closureReason, setClosureReason] = useState<AvailabilityOverrideReasonType>(initial?.closureReason ?? 'holiday');
  const [date, setDate] = useState(initial?.date ?? '');
  const [customHours, setCustomHours] = useState<ClientPeriod[]>(() => initial?.customHours?.map(makePeriod) ?? [makePeriod()]);
  const [blockedPeriods, setBlockedPeriods] = useState<ClientBlockedPeriod[]>(() => initial?.blockedPeriods.map(makeBlockedPeriod) ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const minDate = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload: CreateAvailabilityOverrideRequest = {
      date,
      isClosed: mode === 'closed',
      ...(mode === 'closed' ? { closureReason } : {}),
      ...(mode === 'custom' ? { customHours: customHours.map(({ startTime, endTime }) => ({ startTime, endTime })) } : {}),
      blockedPeriods: mode === 'closed' ? [] : blockedPeriods.map(({ startTime, endTime, reason }) => ({ startTime, endTime, ...(reason?.trim() ? { reason: reason.trim() } : {}) })),
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
    <Modal open={open} onClose={onClose} title={initial ? 'Edit daily availability' : 'Add daily availability'} className="max-h-[90vh] max-w-3xl overflow-y-auto">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">
          Date
          <Input
            type="date"
            min={minDate}
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
            onChange={(event) => setMode(event.target.value as ScheduleMode)}
            options={[
              { value: 'regular', label: 'Use regular opening hours' },
              { value: 'custom', label: 'Use custom opening hours' },
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
              onChange={(event) => setClosureReason(event.target.value as AvailabilityOverrideReasonType)}
              options={Object.entries(reasonLabels).map(([value, label]) => ({ value, label }))}
            />
          </label>
        )}
        {mode === 'custom' && (
          <PeriodSection
            title="Custom opening periods"
            description="These periods replace the regular opening hours for this date."
            periods={customHours}
            onChange={setCustomHours}
            onAdd={() => setCustomHours((current) => [...current, makePeriod()])}
            minimumOne
          />
        )}
        {mode !== 'closed' && (
          <PeriodSection
            title="Blocked periods"
            description="Optional periods removed from the effective opening schedule."
            periods={blockedPeriods}
            onChange={setBlockedPeriods}
            onAdd={() => setBlockedPeriods((current) => [...current, makeBlockedPeriod()])}
            withReason
          />
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

interface ClientTimePeriod extends AvailabilityPeriodDTO { clientId: string; reason?: string }

function PeriodSection<T extends ClientTimePeriod>({ title, description, periods, onChange, onAdd, minimumOne = false, withReason = false }: {
  title: string; description: string; periods: T[]; onChange: (periods: T[]) => void;
  onAdd: () => void; minimumOne?: boolean; withReason?: boolean;
}) {
  const update = (index: number, changes: Partial<T>) => onChange(periods.map((period, itemIndex) => itemIndex === index ? { ...period, ...changes } : period));
  return (
    <fieldset className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><legend className="text-sm font-medium">{title}</legend><p className="text-xs text-muted-foreground">{description}</p></div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}><Plus size={14} /> Add period</Button>
      </div>
      {periods.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">No blocked periods.</p>}
      {periods.map((period, index) => (
        <div key={period.clientId} className="grid gap-3 rounded-md bg-muted p-3 md:grid-cols-2">
          <label className="text-xs font-medium">Start time<TimeInput ariaLabel={`${title} ${index + 1} start`} value={period.startTime} onChange={(startTime) => update(index, { startTime } as Partial<T>)} className="mt-2" /></label>
          <label className="text-xs font-medium">End time<TimeInput ariaLabel={`${title} ${index + 1} end`} value={period.endTime} onChange={(endTime) => update(index, { endTime } as Partial<T>)} className="mt-2" /></label>
          {withReason && <label className="text-xs font-medium md:col-span-2">Reason <span className="font-normal text-muted-foreground">(optional)</span><Input value={period.reason ?? ''} maxLength={200} onChange={(event) => update(index, { reason: event.target.value } as Partial<T>)} className="mt-2" /></label>}
          <Button type="button" variant="ghost" size="sm" className="justify-self-end text-destructive md:col-span-2" disabled={minimumOne && periods.length === 1} onClick={() => onChange(periods.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={15} /> Remove</Button>
        </div>
      ))}
    </fieldset>
  );
}
