/** DI tokens identifying the OTP module's ports, resolved by the composition root. */
export const OTP_TOKENS = {
  OtpRepository: Symbol('IOtpRepository'),
  OtpService: Symbol('IOtpService'),
  EmailService: Symbol('IEmailService'),
  OtpSessionTokenService: Symbol('IOtpSessionTokenService'),
  SendOtpUseCase: Symbol('ISendOtpUseCase'),
  VerifyOtpUseCase: Symbol('IVerifyOtpUseCase'),
  GetOtpSessionUseCase: Symbol('IGetOtpSessionUseCase'),
} as const;
