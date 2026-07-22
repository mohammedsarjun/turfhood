import { inject, injectable } from 'tsyringe';
import type { LocationOption } from '@turfhood/shared';
import type { ILocationLookupService } from '@domain/location/services/ILocationLookupService';
import { LOCATION_TOKENS } from '@domain/location/tokens';

import type { IListCountriesUseCase } from './IListCountriesUseCase.js';

@injectable()
export class ListCountriesUseCase implements IListCountriesUseCase {
  constructor(
    @inject(LOCATION_TOKENS.LocationLookupService)
    private readonly locationLookupService: ILocationLookupService,
  ) {}

  async execute(): Promise<LocationOption[]> {
    return this.locationLookupService.getCountries();
  }
}
