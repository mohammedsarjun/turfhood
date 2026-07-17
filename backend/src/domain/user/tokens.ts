/** DI tokens identifying the user module's ports, resolved by the composition root. */
export const USER_TOKENS = {
  UserRepository: Symbol('IUserRepository'),
  PasswordHasher: Symbol('IPasswordHasher'),
  TokenService: Symbol('ITokenService'),
} as const;
