/** DI tokens identifying the amenity module's ports, resolved by the composition root. */
export const AMENITY_TOKENS = {
  AmenityRepository: Symbol('IAmenityRepository'),
  ListAmenitiesUseCase: Symbol('IListAmenitiesUseCase'),
  CreateAmenityUseCase: Symbol('ICreateAmenityUseCase'),
  UpdateAmenityUseCase: Symbol('IUpdateAmenityUseCase'),
  ToggleAmenityListedUseCase: Symbol('IToggleAmenityListedUseCase'),
  UploadAmenityIconUseCase: Symbol('IUploadAmenityIconUseCase'),
} as const;
