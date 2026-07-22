import { injectable } from 'tsyringe';
import type { LocationOption } from '@turfhood/shared';
import type { ILocationLookupService } from '@domain/location/services/ILocationLookupService';
import { env } from '@config/env';

interface CscCountry {
  name: string;
  iso2: string;
}

interface CscState {
  name: string;
  iso2: string;
}

interface CscCity {
  id: number;
  name: string;
}

/**
 * Country/state/city catalog backed by the CountryStateCity API (api.countrystatecity.in).
 * The underlying data is effectively static and the free tier is rate-limited, so each method
 * caches its result in-memory for the life of the process.
 */
@injectable()
export class CountryStateCityLocationLookupService implements ILocationLookupService {
  private countriesCache: LocationOption[] | null = null;
  private readonly statesCache = new Map<string, LocationOption[]>();
  private readonly citiesCache = new Map<string, LocationOption[]>();

  async getCountries(): Promise<LocationOption[]> {
    if (this.countriesCache) return this.countriesCache;

    const countries = await this.request<CscCountry[]>('/countries');
    const options = countries.map((country) => ({ name: country.name, code: country.iso2 }));
    this.countriesCache = options;
    return options;
  }

  async getStates(countryCode: string): Promise<LocationOption[]> {
    const cached = this.statesCache.get(countryCode);
    if (cached) return cached;

    const states = await this.request<CscState[]>(`/countries/${countryCode}/states`);
    const options = states.map((state) => ({ name: state.name, code: state.iso2 }));
    this.statesCache.set(countryCode, options);
    return options;
  }

  async getCities(countryCode: string, stateCode: string): Promise<LocationOption[]> {
    const cacheKey = `${countryCode}:${stateCode}`;
    const cached = this.citiesCache.get(cacheKey);
    if (cached) return cached;

    const cities = await this.request<CscCity[]>(
      `/countries/${countryCode}/states/${stateCode}/cities`,
    );
    const options = cities.map((city) => ({ name: city.name, code: String(city.id) }));
    this.citiesCache.set(cacheKey, options);
    return options;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${env.CSC_API_BASE_URL}${path}`, {
      headers: { 'X-CSCAPI-KEY': env.CSC_API_KEY },
    });
    if (!response.ok) {
      throw new Error(`CountryStateCity API request failed: ${response.status} ${path}`);
    }
    return (await response.json()) as T;
  }
}
