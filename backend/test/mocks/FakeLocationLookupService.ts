import type { LocationOption } from '@turfhood/shared';
import type { ILocationLookupService } from '../../src/domain/location/services/ILocationLookupService.js';

const COUNTRIES: LocationOption[] = [{ name: 'India', code: 'IN' }];
const STATES: Record<string, LocationOption[]> = {
  IN: [{ name: 'Tamil Nadu', code: 'TN' }],
};
const CITIES: Record<string, LocationOption[]> = {
  'IN:TN': [{ name: 'Chennai', code: '1' }],
};

export class FakeLocationLookupService implements ILocationLookupService {
  async getCountries(): Promise<LocationOption[]> {
    return COUNTRIES;
  }

  async getStates(countryCode: string): Promise<LocationOption[]> {
    return STATES[countryCode] ?? [];
  }

  async getCities(countryCode: string, stateCode: string): Promise<LocationOption[]> {
    return CITIES[`${countryCode}:${stateCode}`] ?? [];
  }
}
