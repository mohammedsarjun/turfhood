/** DI tokens identifying the turf module's ports, resolved by the composition root. */
export const TURF_TOKENS = {
  TurfRepository: Symbol('ITurfRepository'),
  TurfImageRepository: Symbol('ITurfImageRepository'),
  ListNearbyTurfsUseCase: Symbol('IListNearbyTurfsUseCase'),
  GetTurfDetailsUseCase: Symbol('IGetTurfDetailsUseCase'),
  GetOwnerDashboardUseCase: Symbol('IGetOwnerDashboardUseCase'),
  GetOwnerRevenueUseCase: Symbol('IGetOwnerRevenueUseCase'),
} as const;
