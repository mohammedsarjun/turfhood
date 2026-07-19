/** DI tokens identifying the admin module's ports, resolved by the composition root. */
export const ADMIN_TOKENS = {
  SeedAdminUseCase: Symbol('ISeedAdminUseCase'),
  AdminLoginUseCase: Symbol('IAdminLoginUseCase'),
} as const;
