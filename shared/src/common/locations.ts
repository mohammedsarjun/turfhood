export interface LocationState {
  name: string;
  cities: string[];
}

export interface LocationCountry {
  name: string;
  code: string;
  states: LocationState[];
}

/**
 * Centralized, predefined country/state/city dataset — never persisted to the database.
 * Frontend cascading dropdowns and backend submission validation both read from this single
 * source of truth. Extend the list here (not per-consumer) when new locations are needed.
 */
export const LOCATIONS: LocationCountry[] = [
  {
    name: 'India',
    code: 'IN',
    states: [
      {
        name: 'Tamil Nadu',
        cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
      },
      { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangaluru'] },
      { name: 'Kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'] },
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
      { name: 'Telangana', cities: ['Hyderabad'] },
      { name: 'Delhi', cities: ['New Delhi'] },
    ],
  },
];

export function getCountries(): string[] {
  return LOCATIONS.map((country) => country.name);
}

export function getStates(countryName: string): string[] {
  const country = LOCATIONS.find((entry) => entry.name === countryName);
  return country ? country.states.map((state) => state.name) : [];
}

export function getCities(countryName: string, stateName: string): string[] {
  const country = LOCATIONS.find((entry) => entry.name === countryName);
  const state = country?.states.find((entry) => entry.name === stateName);
  return state ? state.cities : [];
}

export function isValidLocation(countryName: string, stateName: string, cityName: string): boolean {
  return getCities(countryName, stateName).includes(cityName);
}
