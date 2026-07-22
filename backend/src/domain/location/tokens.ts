/** DI tokens identifying the location module's ports, resolved by the composition root. */
export const LOCATION_TOKENS = {
  LocationLookupService: Symbol('ILocationLookupService'),
  ListCountriesUseCase: Symbol('IListCountriesUseCase'),
  ListStatesUseCase: Symbol('IListStatesUseCase'),
  ListCitiesUseCase: Symbol('IListCitiesUseCase'),
} as const;
