import type { LocationOption } from '@turfhood/shared';

export interface IListStatesUseCase {
  execute(countryCode: string): Promise<LocationOption[]>;
}
