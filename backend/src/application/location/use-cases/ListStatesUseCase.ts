import { inject, injectable } from 'tsyringe';
import type { LocationOption } from '@turfhood/shared';
import type { ILocationLookupService } from '@domain/location/services/ILocationLookupService';
import { LOCATION_TOKENS } from '@domain/location/tokens';

import type { IListStatesUseCase } from './IListStatesUseCase.js';

@injectable()
export class ListStatesUseCase implements IListStatesUseCase {
  constructor(
    @inject(LOCATION_TOKENS.LocationLookupService)
    private readonly locationLookupService: ILocationLookupService,
  ) {}

  async execute(countryCode: string): Promise<LocationOption[]> {
    return this.locationLookupService.getStates(countryCode);
  }
}
