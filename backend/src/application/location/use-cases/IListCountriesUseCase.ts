import type { LocationOption } from '@turfhood/shared';

export interface IListCountriesUseCase {
  execute(): Promise<LocationOption[]>;
}
