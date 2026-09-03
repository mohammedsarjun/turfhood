'use client';

import { useEffect, useState } from 'react';
import { LocateFixed, X } from 'lucide-react';
import type { CatalogItem, LocationOption, TurfDiscoveryFilters } from '@turfhood/shared';
import { Button, Input, Select } from '@/components/ui';
import { listCities, listStates } from '@/features/turf-onboarding/actions/locationApi';
import {
  listPublicAmenities,
  listPublicSportsTypes,
} from '@/features/turf-onboarding/actions/catalogApi';
import { cn } from '@/lib/utils';

export type DiscoveryFilterValues = Omit<TurfDiscoveryFilters, 'page' | 'limit'>;

export function TurfFilters({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (filters: DiscoveryFilterValues) => void;
}) {
  const [states, setStates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [sports, setSports] = useState<CatalogItem[]>([]);
  const [amenities, setAmenities] = useState<CatalogItem[]>([]);
  const [stateCode, setStateCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [sportTypeId, setSportTypeId] = useState('');
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [minRating, setMinRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [nearMe, setNearMe] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [locationError, setLocationError] = useState('');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  const buildFilters = (
    nearCoordinates: { latitude: number; longitude: number } | null,
  ): DiscoveryFilterValues => {
    const state = states.find((item) => item.code === stateCode);
    const city = cities.find((item) => item.code === cityCode);
    return {
      ...(nearCoordinates ?? {}),
      ...(!nearCoordinates && state ? { stateCode: state.code, stateName: state.name } : {}),
      ...(!nearCoordinates && city ? { cityCode: city.code, cityName: city.name } : {}),
      ...(sportTypeId ? { sportTypeId } : {}),
      ...(amenityIds.length ? { amenityIds } : {}),
      ...(minRating ? { minRating: Number(minRating) } : {}),
      ...(minPrice ? { minPrice: Number(minPrice) } : {}),
      ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
    };
  };

  useEffect(() => {
    void Promise.all([listStates('IN'), listPublicSportsTypes(), listPublicAmenities()]).then(
      ([stateResult, sportResult, amenityResult]) => {
        setStates(stateResult.items);
        setSports(sportResult.items);
        setAmenities(amenityResult.items);
      },
    );
  }, []);
  const changeState = (code: string) => {
    setStateCode(code);
    setCityCode('');
    setCities([]);
    if (code) void listCities('IN', code).then((result) => setCities(result.items));
  };
  const toggleNearMe = () => {
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
    navigator.geolocation.getCurrentPosition(
      (position) => {
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
        setNearMe(false);
        setCoordinates(null);
        setLocationAccuracy(null);
        setLocationError('Allow location access to use Near Me.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };
  const apply = () => {
    onApply(buildFilters(nearMe ? coordinates : null));
    onClose();
  };
  const clear = () => {
    setNearMe(false);
    setCoordinates(null);
    setLocationAccuracy(null);
    setStateCode('');
    setCityCode('');
    setSportTypeId('');
    setAmenityIds([]);
    setMinRating('');
    setMinPrice('');
    setMaxPrice('');
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
              <p className="mt-1 text-xs text-muted-foreground">Sort by exact distance</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={nearMe}
              onClick={toggleNearMe}
              className={cn(
                'relative h-7 w-12 rounded-full transition',
                nearMe ? 'bg-primary' : 'bg-slate-300',
              )}
            >
              <span
                className={cn(
                  'absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  nearMe && 'translate-x-5',
                )}
              />
            </button>
          </div>
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
        <FilterLabel label="State">
          <Select
            disabled={nearMe}
            value={stateCode}
            onChange={(event) => changeState(event.target.value)}
            options={[
              { label: 'All states', value: '' },
              ...states.map((item) => ({ label: item.name, value: item.code })),
            ]}
          />
        </FilterLabel>
        <FilterLabel label="City">
          <Select
            disabled={nearMe || !stateCode}
            value={cityCode}
            onChange={(event) => setCityCode(event.target.value)}
            options={[
              { label: 'All cities', value: '' },
              ...cities.map((item) => ({ label: item.name, value: item.code })),
            ]}
          />
        </FilterLabel>
        <FilterLabel label="Sport">
          <Select
            value={sportTypeId}
            onChange={(event) => setSportTypeId(event.target.value)}
            options={[
              { label: 'All sports', value: '' },
              ...sports.map((item) => ({ label: item.name, value: item.id })),
            ]}
          />
        </FilterLabel>
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-medium">Amenities</legend>
          <div className="max-h-36 space-y-2 overflow-y-auto rounded-md border border-border p-3">
            {amenities.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={amenityIds.includes(item.id)}
                  onChange={() =>
                    setAmenityIds((values) =>
                      values.includes(item.id)
                        ? values.filter((id) => id !== item.id)
                        : [...values, item.id],
                    )
                  }
                  className="accent-primary"
                />
                {item.name}
              </label>
            ))}
          </div>
        </fieldset>
        <FilterLabel label="Minimum rating">
          <Select
            value={minRating}
            onChange={(event) => setMinRating(event.target.value)}
            options={[
              { label: 'Any rating', value: '' },
              { label: '4+ stars', value: '4' },
              { label: '3+ stars', value: '3' },
              { label: '2+ stars', value: '2' },
            ]}
          />
        </FilterLabel>
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">Price per slot</p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min ₹"
              aria-label="Minimum price"
            />
            <Input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max ₹"
              aria-label="Maximum price"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={clear}>
            Clear
          </Button>
          <Button type="button" onClick={apply}>
            Apply
          </Button>
        </div>
      </aside>
    </>
  );
}

function FilterLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
