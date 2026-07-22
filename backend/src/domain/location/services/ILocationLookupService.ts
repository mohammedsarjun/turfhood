import type { LocationOption } from '@turfhood/shared';

/** Looks up country/state/city catalog data from a third-party provider (see CSC-backed impl). */
export interface ILocationLookupService {
  getCountries(): Promise<LocationOption[]>;
  getStates(countryCode: string): Promise<LocationOption[]>;
  getCities(countryCode: string, stateCode: string): Promise<LocationOption[]>;
}
