/** DI tokens identifying the sportsType module's ports, resolved by the composition root. */
export const SPORTS_TYPE_TOKENS = {
  SportsTypeRepository: Symbol('ISportsTypeRepository'),
  ListSportsTypesUseCase: Symbol('IListSportsTypesUseCase'),
  CreateSportsTypeUseCase: Symbol('ICreateSportsTypeUseCase'),
  UpdateSportsTypeUseCase: Symbol('IUpdateSportsTypeUseCase'),
  ToggleSportsTypeListedUseCase: Symbol('IToggleSportsTypeListedUseCase'),
  UploadSportsTypeIconUseCase: Symbol('IUploadSportsTypeIconUseCase'),
} as const;
