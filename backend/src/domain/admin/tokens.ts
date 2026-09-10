/** DI tokens identifying the admin module's ports, resolved by the composition root. */
export const ADMIN_TOKENS = {
  SeedAdminUseCase: Symbol('ISeedAdminUseCase'),
  AdminLoginUseCase: Symbol('IAdminLoginUseCase'),
  DashboardRepository: Symbol('IAdminDashboardRepository'),
  DashboardUseCase: Symbol('IGetAdminDashboardUseCase'),
  RevenueUseCase: Symbol('IGetAdminRevenueUseCase'),
} as const;
