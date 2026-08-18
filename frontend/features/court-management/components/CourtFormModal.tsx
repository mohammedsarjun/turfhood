'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import {
  createCourtSchema,
  getOverlappingPricingBandIndexes,
  type CatalogItem,
  type CourtStatus,
  type CreateCourtFields,
} from '@turfhood/shared';
import { ApiError } from '@/types/api/response';
import { Button, Input, Modal, Select, useToast } from '@/components/ui';
import { TurfImageUpload, type TurfImageEntry } from '@/features/turf-onboarding';
import { listPublicSportsTypes } from '@/features/turf-onboarding/actions/catalogApi';
import { createCourt } from '../actions/courtApi';
import { cn } from '@/lib/utils';

interface CourtFormModalProps {
  turfId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type PricingBand = CreateCourtFields['pricingRules'][number] & { clientId: string };

function createPricingBand(dayType: PricingBand['dayType'] = 'weekday'): PricingBand {
  return {
    clientId: crypto.randomUUID(),
    dayType,
    startTime: '06:00',
    endTime: '10:00',
    pricePerSlot: 0,
  };
}

type CourtFieldErrors = Partial<Record<keyof CreateCourtFields, string>>;

export function CourtFormModal({ turfId, open, onClose, onCreated }: CourtFormModalProps) {
  const { showToast } = useToast();
  const [sports, setSports] = useState<CatalogItem[]>([]);
  const [name, setName] = useState('');
  const [sportTypeIds, setSportTypeIds] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(10);
  const [status, setStatus] = useState<CourtStatus>('active');
  const [allowOpenSessions, setAllowOpenSessions] = useState(false);
  const [minPlayers, setMinPlayers] = useState(2);
  const [slotDuration, setSlotDuration] = useState(60);
  const [pricingRules, setPricingRules] = useState<PricingBand[]>(() => [
    createPricingBand('weekday'),
    createPricingBand('weekend'),
  ]);
  const [images, setImages] = useState<TurfImageEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CourtFieldErrors>({});
  const overlappingBandIndexes = useMemo(
    () => new Set(getOverlappingPricingBandIndexes(pricingRules)),
    [pricingRules],
  );

  const clearFieldError = useCallback((field: keyof CreateCourtFields) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setError(null);
  }, []);

  useEffect(() => {
    if (!open || sports.length > 0) return;
    void listPublicSportsTypes()
      .then((result) => setSports(result.items))
      .catch(() => setError('Failed to load sports.'));
  }, [open, sports.length]);

  const toggleSport = (id: string) => {
    clearFieldError('sportTypeIds');
    setSportTypeIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload: CreateCourtFields = {
      name: name.trim(),
      sportTypeIds,
      capacity,
      status,
      allowOpenSessions,
      minPlayersForOpenSession: allowOpenSessions ? minPlayers : 1,
      slotDurationMinutes: slotDuration,
      imageCoverFlags: images.map((image) => image.isCover),
      pricingRules: pricingRules.map(({ dayType, startTime, endTime, pricePerSlot }) => ({
        dayType,
        startTime,
        endTime,
        pricePerSlot,
      })),
    };
    const validation = createCourtSchema.safeParse(payload);
    if (!validation.success) {
      const errors: CourtFieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CreateCourtFields | undefined;
        if (field && !errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      setError('Please correct the highlighted fields.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await createCourt(
        turfId,
        validation.data,
        images.map((image) => image.file),
      );
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setImages([]);
      setName('');
      setSportTypeIds([]);
      showToast('Court created successfully.', 'success');
      onCreated();
      onClose();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Failed to create court.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Court"
      className="max-h-[90vh] max-w-3xl overflow-y-auto"
    >
      <form noValidate onSubmit={(event) => void submit(event)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            <span className="mb-2 block">Court name</span>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearFieldError('name');
              }}
              errorMessage={fieldErrors.name}
            />
          </label>
          <label className="text-sm font-medium">
            <span className="mb-2 block">Status</span>
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as CourtStatus);
                clearFieldError('status');
              }}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Maintenance', value: 'maintenance' },
              ]}
            />
          </label>
          <label className="text-sm font-medium">
            <span className="mb-2 block">Capacity</span>
            <Input
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(event) => {
                setCapacity(Number(event.target.value));
                clearFieldError('capacity');
                clearFieldError('minPlayersForOpenSession');
              }}
              errorMessage={fieldErrors.capacity}
            />
          </label>
          <label className="text-sm font-medium">
            <span className="mb-2 block">Slot duration (minutes)</span>
            <Input
              type="number"
              min={15}
              max={240}
              step={15}
              value={slotDuration}
              onChange={(event) => {
                setSlotDuration(Number(event.target.value));
                clearFieldError('slotDurationMinutes');
              }}
              errorMessage={fieldErrors.slotDurationMinutes}
            />
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Sports</legend>
          <div className="flex flex-wrap gap-3">
            {sports.map((sport) => (
              <label
                key={sport.id}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={sportTypeIds.includes(sport.id)}
                  onChange={() => toggleSport(sport.id)}
                />
                {sport.name}
              </label>
            ))}
          </div>
          {fieldErrors.sportTypeIds && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {fieldErrors.sportTypeIds}
            </p>
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={allowOpenSessions}
              onChange={(event) => {
                setAllowOpenSessions(event.target.checked);
                clearFieldError('allowOpenSessions');
                clearFieldError('minPlayersForOpenSession');
              }}
            />
            Allow open sessions
          </label>
          {allowOpenSessions && (
            <label className="text-sm font-medium">
              <span className="mb-2 block">Minimum players for open session</span>
              <Input
                type="number"
                min={1}
                max={capacity}
                value={minPlayers}
                onChange={(event) => {
                  setMinPlayers(Number(event.target.value));
                  clearFieldError('minPlayersForOpenSession');
                }}
                errorMessage={fieldErrors.minPlayersForOpenSession}
              />
            </label>
          )}
        </div>

        <fieldset className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <legend className="text-sm font-medium">Pricing rules (INR per slot)</legend>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPricingRules((current) => [...current, createPricingBand()]);
                clearFieldError('pricingRules');
              }}
            >
              <FiPlus size={14} />
              Add Pricing Band
            </Button>
          </div>
          {pricingRules.map((rule, index) => (
            <div
              key={rule.clientId}
              className={cn(
                'grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]',
                overlappingBandIndexes.has(index) ? 'border-destructive' : 'border-border',
              )}
            >
              <label className="text-xs font-medium text-muted-foreground">
                <span className="mb-2 block">Day type</span>
                <Select
                  aria-label={`Pricing band ${index + 1} day type`}
                  value={rule.dayType}
                  options={[
                    { label: 'Weekday', value: 'weekday' },
                    { label: 'Weekend', value: 'weekend' },
                  ]}
                  onChange={(event) => {
                    setPricingRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, dayType: event.target.value as PricingBand['dayType'] }
                          : item,
                      ),
                    );
                    clearFieldError('pricingRules');
                  }}
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                <span className="mb-2 block">Start time</span>
                <Input
                  aria-label={`${rule.dayType} start time`}
                  type="time"
                  value={rule.startTime}
                  onChange={(event) => {
                    setPricingRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, startTime: event.target.value } : item,
                      ),
                    );
                    clearFieldError('pricingRules');
                  }}
                  required
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                <span className="mb-2 block">End time</span>
                <Input
                  aria-label={`${rule.dayType} end time`}
                  type="time"
                  value={rule.endTime}
                  onChange={(event) => {
                    setPricingRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, endTime: event.target.value } : item,
                      ),
                    );
                    clearFieldError('pricingRules');
                  }}
                  required
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                <span className="mb-2 block">Price</span>
                <Input
                  aria-label={`${rule.dayType} price`}
                  type="number"
                  min={0}
                  max={20000}
                  step={1}
                  value={rule.pricePerSlot}
                  onChange={(event) => {
                    setPricingRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, pricePerSlot: Number(event.target.value) }
                          : item,
                      ),
                    );
                    clearFieldError('pricingRules');
                  }}
                  required
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove pricing band ${index + 1}`}
                className="self-end text-destructive"
                disabled={pricingRules.length === 1}
                onClick={() => {
                  setPricingRules((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  );
                  clearFieldError('pricingRules');
                }}
              >
                <FiTrash2 size={16} />
              </Button>
            </div>
          ))}
          {fieldErrors.pricingRules && (
            <p role="alert" className="text-xs text-destructive">
              {fieldErrors.pricingRules}
            </p>
          )}
        </fieldset>

        <div>
          <p className="mb-2 text-sm font-medium">Court images (up to 5)</p>
          <TurfImageUpload
            images={images}
            onChange={(nextImages) => {
              setImages(nextImages);
              clearFieldError('imageCoverFlags');
            }}
            maxImages={5}
            errorMessage={fieldErrors.imageCoverFlags}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create Court
          </Button>
        </div>
      </form>
    </Modal>
  );
}
