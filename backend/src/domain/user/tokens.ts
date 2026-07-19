/** DI tokens identifying the user module's ports, resolved by the composition root. */
export const USER_TOKENS = {
  UserRepository: Symbol('IUserRepository'),
  PasswordHasher: Symbol('IPasswordHasher'),
  TokenService: Symbol('ITokenService'),
  GoogleAuthService: Symbol('IGoogleAuthService'),
  FileStorageService: Symbol('IFileStorageService'),
  SignUpUserUseCase: Symbol('ISignUpUserUseCase'),
  LoginUserUseCase: Symbol('ILoginUserUseCase'),
  GetCurrentUserUseCase: Symbol('IGetCurrentUserUseCase'),
  LoginWithGoogleUseCase: Symbol('ILoginWithGoogleUseCase'),
  UpdateNameUseCase: Symbol('IUpdateNameUseCase'),
  UpdatePhoneUseCase: Symbol('IUpdatePhoneUseCase'),
  RequestEmailChangeUseCase: Symbol('IRequestEmailChangeUseCase'),
  ConfirmEmailChangeUseCase: Symbol('IConfirmEmailChangeUseCase'),
  ChangePasswordUseCase: Symbol('IChangePasswordUseCase'),
  SetPasswordUseCase: Symbol('ISetPasswordUseCase'),
  UpdateAvatarUseCase: Symbol('IUpdateAvatarUseCase'),
} as const;
