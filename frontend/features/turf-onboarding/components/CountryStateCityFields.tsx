import { useMemo } from 'react';
import { Select } from '@/components/ui';
import { getCities, getCountries, getStates } from '@turfhood/shared';

export interface CountryStateCityValue {
  country: string;
  state: string;
  city: string;
}

export interface CountryStateCityFieldsProps {
  value: CountryStateCityValue;
  onChange: (value: CountryStateCityValue) => void;
  errors?: { country?: string; state?: string; city?: string };
}

/** Cascading country/state/city dropdowns backed by the centralized `shared` location dataset. */
export function CountryStateCityFields({ value, onChange, errors }: CountryStateCityFieldsProps) {
  const countries = useMemo(() => getCountries(), []);
  const states = useMemo(() => (value.country ? getStates(value.country) : []), [value.country]);
  const cities = useMemo(
    () => (value.country && value.state ? getCities(value.country, value.state) : []),
    [value.country, value.state],
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
        <Select
          value={value.country}
          errorMessage={errors?.country}
          onChange={(event) => onChange({ country: event.target.value, state: '', city: '' })}
          options={[
            { label: 'Select country', value: '' },
            ...countries.map((country) => ({ label: country, value: country })),
          ]}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">State</label>
        <Select
          value={value.state}
          disabled={!value.country}
          errorMessage={errors?.state}
          onChange={(event) => onChange({ ...value, state: event.target.value, city: '' })}
          options={[
            { label: 'Select state', value: '' },
            ...states.map((state) => ({ label: state, value: state })),
          ]}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
        <Select
          value={value.city}
          disabled={!value.state}
          errorMessage={errors?.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          options={[
            { label: 'Select city', value: '' },
            ...cities.map((city) => ({ label: city, value: city })),
          ]}
        />
      </div>
    </div>
  );
}
