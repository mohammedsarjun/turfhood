/** DI tokens identifying the password-reset module's ports, resolved by the composition root. */
export const PASSWORD_RESET_TOKENS = {
  PasswordResetTokenRepository: Symbol('IPasswordResetTokenRepository'),
  PasswordResetTokenService: Symbol('IPasswordResetTokenService'),
  RequestPasswordResetUseCase: Symbol('IRequestPasswordResetUseCase'),
  ResetPasswordUseCase: Symbol('IResetPasswordUseCase'),
} as const;
