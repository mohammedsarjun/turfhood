import { useEffect, useState } from 'react';
import { Select } from '@/components/ui';
import type { LocationOption } from '@turfhood/shared';
import { listCities, listCountries, listStates } from '../actions/locationApi';

export interface CountryStateCityValue {
  country: LocationOption | null;
  state: LocationOption | null;
  city: LocationOption | null;
}

export interface CountryStateCityFieldsProps {
  value: CountryStateCityValue;
  onChange: (value: CountryStateCityValue) => void;
  errors?: { country?: string; state?: string; city?: string };
}

/** Cascading country/state/city dropdowns backed by the backend's CountryStateCity-proxied catalog. */
export function CountryStateCityFields({ value, onChange, errors }: CountryStateCityFieldsProps) {
  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [states, setStates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadCountries() {
      setIsLoadingCountries(true);
      try {
        const result = await listCountries();
        if (!cancelled) setCountries(result.items);
      } finally {
        if (!cancelled) setIsLoadingCountries(false);
      }
    }
    void loadCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStates() {
      if (!value.country) {
        if (!cancelled) setStates([]);
        return;
      }
      setIsLoadingStates(true);
      try {
        const result = await listStates(value.country.code);
        if (!cancelled) setStates(result.items);
      } finally {
        if (!cancelled) setIsLoadingStates(false);
      }
    }
    void loadStates();
    return () => {
      cancelled = true;
    };
  }, [value.country]);

  useEffect(() => {
    let cancelled = false;
    async function loadCities() {
      if (!value.country || !value.state) {
        if (!cancelled) setCities([]);
        return;
      }
      setIsLoadingCities(true);
      try {
        const result = await listCities(value.country.code, value.state.code);
        if (!cancelled) setCities(result.items);
      } finally {
        if (!cancelled) setIsLoadingCities(false);
      }
    }
    void loadCities();
    return () => {
      cancelled = true;
    };
  }, [value.country, value.state]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
        <Select
          value={value.country?.code ?? ''}
          disabled={isLoadingCountries}
          errorMessage={errors?.country}
          onChange={(event) => {
            const country = countries.find((option) => option.code === event.target.value) ?? null;
            onChange({ country, state: null, city: null });
          }}
          options={[
            { label: 'Select country', value: '' },
            ...countries.map((country) => ({ label: country.name, value: country.code })),
          ]}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">State</label>
        <Select
          value={value.state?.code ?? ''}
          disabled={!value.country || isLoadingStates}
          errorMessage={errors?.state}
          onChange={(event) => {
            const state = states.find((option) => option.code === event.target.value) ?? null;
            onChange({ ...value, state, city: null });
          }}
          options={[
            { label: 'Select state', value: '' },
            ...states.map((state) => ({ label: state.name, value: state.code })),
          ]}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
        <Select
          value={value.city?.code ?? ''}
          disabled={!value.state || isLoadingCities}
          errorMessage={errors?.city}
          onChange={(event) => {
            const city = cities.find((option) => option.code === event.target.value) ?? null;
            onChange({ ...value, city });
          }}
          options={[
            { label: 'Select city', value: '' },
            ...cities.map((city) => ({ label: city.name, value: city.code })),
          ]}
        />
      </div>
    </div>
  );
}
