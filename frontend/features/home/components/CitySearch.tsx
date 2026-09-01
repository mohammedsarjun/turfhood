'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { LocationOption } from '@turfhood/shared';
import { Button, Input, Select } from '@/components/ui';
import { listCities, listStates } from '@/features/turf-onboarding/actions/locationApi';
import { reverseGeocodeLocation } from '@/features/turf-onboarding/lib/searchLocation';

const SAVED_LOCATION_KEY = 'turfhood.homeLocation';

export interface HomeLocationSelection {
  state: LocationOption;
  city: LocationOption;
}

export function CitySearch({ onSearch }: { onSearch: (location: HomeLocationSelection) => void }) {
  const [states, setStates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [stateCode, setStateCode] = useState('');
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    let cancelled = false;
    void listStates('IN').then(async (response) => {
      if (cancelled) return;
      setStates(response.items);
      const saved = window.localStorage.getItem(SAVED_LOCATION_KEY);
      if (saved) {
        const location = JSON.parse(saved) as HomeLocationSelection;
        const state = response.items.find((item) => item.code === location.state.code);
        if (state) {
          const cityResponse = await listCities('IN', state.code);
          const city = cityResponse.items.find((item) => item.code === location.city.code);
          if (!cancelled && city) {
            setStateCode(state.code);
            setCities(cityResponse.items);
            setCityName(city.name);
            onSearch({ state, city });
            return;
          }
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
          const city = cityResponse.items.find(
            (item) => item.name.toLowerCase() === address.city.toLowerCase(),
          );
          if (!city || cancelled) return;
          setStateCode(state.code);
          setCities(cityResponse.items);
          setCityName(city.name);
          onSearch({ state, city });
        });
      });
    });
    return () => {
      cancelled = true;
    };
  }, [onSearch]);

  const changeState = (code: string) => {
    setStateCode(code);
    setCityName('');
    setCities([]);
    if (code) void listCities('IN', code).then((response) => setCities(response.items));
  };
  const selectedCity = useMemo(
    () => cities.find((city) => city.name.toLowerCase() === cityName.trim().toLowerCase()),
    [cities, cityName],
  );
  const selectedState = states.find((state) => state.code === stateCode);
  const search = () => {
    if (!selectedState || !selectedCity) return;
    const location = { state: selectedState, city: selectedCity };
    window.localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(location));
    onSearch(location);
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
      <div className="w-full">
        <Input
          aria-label="Search city"
          list="indian-city-options"
          value={cityName}
          onChange={(event) => setCityName(event.target.value)}
          placeholder="Search city"
          disabled={!stateCode}
        />
        <datalist id="indian-city-options">
          {cities.map((city) => (
            <option key={city.code} value={city.name} />
          ))}
        </datalist>
      </div>
      <Button type="button" disabled={!selectedCity} onClick={search} className="h-11">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </div>
  );
}
