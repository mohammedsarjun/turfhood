import { inject, injectable } from 'tsyringe';
import type { LocationOption } from '@turfhood/shared';
import type { ILocationLookupService } from '@domain/location/services/ILocationLookupService';
import { LOCATION_TOKENS } from '@domain/location/tokens';

import type { IListCitiesUseCase } from './IListCitiesUseCase.js';

@injectable()
export class ListCitiesUseCase implements IListCitiesUseCase {
  constructor(
    @inject(LOCATION_TOKENS.LocationLookupService)
    private readonly locationLookupService: ILocationLookupService,
  ) {}

  async execute(countryCode: string, stateCode: string): Promise<LocationOption[]> {
    return this.locationLookupService.getCities(countryCode, stateCode);
  }
}
