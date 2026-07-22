import type { LocationOption } from '@turfhood/shared';

export interface IListCitiesUseCase {
  execute(countryCode: string, stateCode: string): Promise<LocationOption[]>;
}
