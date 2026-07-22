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
export declare const LOCATIONS: LocationCountry[];
export declare function getCountries(): string[];
export declare function getStates(countryName: string): string[];
export declare function getCities(countryName: string, stateName: string): string[];
export declare function isValidLocation(countryName: string, stateName: string, cityName: string): boolean;
