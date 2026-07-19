/** DI tokens identifying the user module's ports, resolved by the composition root. */
export const USER_TOKENS = {
  UserRepository: Symbol('IUserRepository'),
  PasswordHasher: Symbol('IPasswordHasher'),
  TokenService: Symbol('ITokenService'),
  SignUpUserUseCase: Symbol('ISignUpUserUseCase'),
  LoginUserUseCase: Symbol('ILoginUserUseCase'),
  GetCurrentUserUseCase: Symbol('IGetCurrentUserUseCase'),
} as const;
