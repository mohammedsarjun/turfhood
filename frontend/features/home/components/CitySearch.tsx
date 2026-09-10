'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { LocationOption } from '@turfhood/shared';
import { Button, Select } from '@/components/ui';
import { listCities, listStates } from '@/features/turf-onboarding/actions/locationApi';
import { reverseGeocodeLocation } from '@/features/turf-onboarding/lib/searchLocation';

const SAVED_LOCATION_KEY = 'turfhood.homeLocation';

export interface HomeLocationSelection {
  state: LocationOption;
  city: LocationOption;
}

interface CitySearchProps {
  onSearch: (location: HomeLocationSelection) => Promise<void>;
}

const normalizeLocationName = (name: string) =>
  name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/\b(district|division)\b/g, '')
    .replace(/[^a-z0-9]/g, '');

export function CitySearch({ onSearch }: CitySearchProps) {
  const [states, setStates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [stateCode, setStateCode] = useState('');
  const [cityCode, setCityCode] = useState('');

  useEffect(() => {
    let cancelled = false;
    void listStates('IN').then(async (response) => {
      if (cancelled) return;
      setStates(response.items);
      const saved = window.localStorage.getItem(SAVED_LOCATION_KEY);
      if (saved) {
        try {
          const location = JSON.parse(saved) as HomeLocationSelection;
          const state = response.items.find((item) => item.code === location.state.code);
          if (state) {
            const cityResponse = await listCities('IN', state.code);
            const city = cityResponse.items.find((item) => item.code === location.city.code);
            if (!cancelled && city) {
              setStateCode(state.code);
              setCities(cityResponse.items);
              setCityCode(city.code);
              await onSearch({ state, city });
              return;
            }
          }
        } catch {
          window.localStorage.removeItem(SAVED_LOCATION_KEY);
        }
      }
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
      if (!apiKey || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((position) => {
        void reverseGeocodeLocation(
          position.coords.latitude,
          position.coords.longitude,
          apiKey,
        ).then(async (address) => {
          if (!address || cancelled) return;
          const state = response.items.find(
            (item) => item.name.toLowerCase() === address.state.toLowerCase(),
          );
          if (!state) return;
          const cityResponse = await listCities('IN', state.code);
          const candidateNames = new Set(address.cityCandidates.map(normalizeLocationName));
          const city = cityResponse.items.find((item) =>
            candidateNames.has(normalizeLocationName(item.name)),
          );
          if (!city || cancelled) return;
          setStateCode(state.code);
          setCities(cityResponse.items);
          setCityCode(city.code);
          await onSearch({ state, city });
        });
      });
    });
    return () => {
      cancelled = true;
    };
  }, [onSearch]);

  const changeState = (code: string) => {
    setStateCode(code);
    setCityCode('');
    setCities([]);
    if (code) void listCities('IN', code).then((response) => setCities(response.items));
  };
  const selectedCity = useMemo(
    () => cities.find((city) => city.code === cityCode),
    [cities, cityCode],
  );
  const selectedState = states.find((state) => state.code === stateCode);
  const search = async () => {
    if (!selectedState || !selectedCity) return;
    const location = { state: selectedState, city: selectedCity };
    window.localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(location));
    await onSearch(location);
  };

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
      <Select
        aria-label="State"
        value={stateCode}
        onChange={(event) => changeState(event.target.value)}
        options={[
          { label: 'Select state', value: '' },
          ...states.map((state) => ({ label: state.name, value: state.code })),
        ]}
      />
      <Select
        aria-label="District"
        value={cityCode}
        onChange={(event) => setCityCode(event.target.value)}
        disabled={!stateCode || !cities.length}
        options={[
          { label: stateCode ? 'Select district' : 'Select state first', value: '' },
          ...cities.map((city) => ({ label: city.name, value: city.code })),
        ]}
      />
      <Button type="button" disabled={!selectedCity} onClick={() => void search()} className="h-11">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </div>
  );
}
