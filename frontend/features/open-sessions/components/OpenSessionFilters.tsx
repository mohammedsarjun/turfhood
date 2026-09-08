'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, LocateFixed, X } from 'lucide-react';
import type { CatalogItem, OpenSessionFilters as OpenSessionFilterParams } from '@turfhood/shared';
import { Button, Select } from '@/components/ui';
import { listPublicSportsTypes } from '@/features/turf-onboarding/actions/catalogApi';
import { cn } from '@/lib/utils';

export type OpenSessionFilterValues = Omit<OpenSessionFilterParams, 'page' | 'limit' | 'nearMe'>;

interface OpenSessionFiltersProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: OpenSessionFilterValues) => void;
}

export function OpenSessionFilters({ open, onClose, onApply }: OpenSessionFiltersProps) {
  const [sports, setSports] = useState<CatalogItem[]>([]);
  const [sportTypeId, setSportTypeId] = useState('');
  const [nearMe, setNearMe] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [locationError, setLocationError] = useState('');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    void listPublicSportsTypes().then((result) => setSports(result.items));
  }, []);

  const buildFilters = (
    nearCoordinates: { latitude: number; longitude: number } | null,
  ): OpenSessionFilterValues => ({
    ...(nearCoordinates ?? {}),
    ...(sportTypeId ? { sportTypeId } : {}),
  });

  const toggleNearMe = () => {
    if (isLocating) return;
    if (nearMe) {
      setNearMe(false);
      setCoordinates(null);
      setLocationAccuracy(null);
      onApply(buildFilters(null));
      return;
    }
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by this browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        if (position.coords.accuracy > 5000) {
          setNearMe(false);
          setCoordinates(null);
          setLocationAccuracy(position.coords.accuracy);
          setLocationError(
            `Your browser location is only accurate to about ${Math.ceil(position.coords.accuracy / 1000)} km. Use a GPS-enabled device or improve browser location accuracy.`,
          );
          return;
        }
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(nextCoordinates);
        setLocationAccuracy(position.coords.accuracy);
        setNearMe(true);
        onApply(buildFilters(nextCoordinates));
      },
      () => {
        setIsLocating(false);
        setNearMe(false);
        setCoordinates(null);
        setLocationAccuracy(null);
        setLocationError('Allow location access to use Near Me.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const clear = () => {
    setSportTypeId('');
    setNearMe(false);
    setCoordinates(null);
    setLocationAccuracy(null);
    setLocationError('');
    onApply({});
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(88vw,340px)] overflow-y-auto border-r border-border bg-card p-5 shadow-xl transition-transform duration-300 lg:sticky lg:top-4 lg:z-auto lg:h-fit lg:w-full lg:translate-x-0 lg:rounded-xl lg:border lg:shadow-sm',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-5 rounded-xl bg-muted p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-medium">
                <LocateFixed className="h-4 w-4 text-primary" />
                Near Me
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Sort sessions by exact distance</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Near Me"
              aria-checked={nearMe}
              aria-busy={isLocating || undefined}
              disabled={isLocating}
              onClick={toggleNearMe}
              className={cn(
                'relative flex h-7 w-12 items-center rounded-full transition disabled:cursor-wait disabled:opacity-70',
                nearMe ? 'bg-primary' : 'bg-slate-300',
              )}
            >
              {isLocating ? (
                <LoaderCircle className="mx-auto h-4 w-4 animate-spin text-white" />
              ) : (
                <span
                  className={cn(
                    'absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    nearMe && 'translate-x-5',
                  )}
                />
              )}
            </button>
          </div>
          {isLocating && (
            <p role="status" className="mt-2 text-xs text-muted-foreground">
              Getting your location…
            </p>
          )}
          {locationError && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {locationError}
            </p>
          )}
          {nearMe && locationAccuracy !== null && (
            <p className="mt-2 text-xs text-success-foreground">
              Location accuracy: approximately ±
              {locationAccuracy < 1000
                ? `${Math.round(locationAccuracy)} m`
                : `${(locationAccuracy / 1000).toFixed(1)} km`}
            </p>
          )}
        </div>
        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-medium">Sport</span>
          <Select
            value={sportTypeId}
            onChange={(event) => setSportTypeId(event.target.value)}
            options={[
              { label: 'All sports', value: '' },
              ...sports.map((sport) => ({ label: sport.name, value: sport.id })),
            ]}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={clear}>
            Clear
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(buildFilters(nearMe ? coordinates : null));
              onClose();
            }}
          >
            Apply
          </Button>
        </div>
      </aside>
    </>
  );
}
