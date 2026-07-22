import 'reflect-metadata';
import { container } from 'tsyringe';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import type { ITokenService } from '@domain/user/services/ITokenService';
import type { IGoogleAuthService } from '@domain/user/services/IGoogleAuthService';
import type { IFileStorageService } from '@domain/shared/services/IFileStorageService';
import { SHARED_TOKENS } from '@domain/shared/tokens';
import { USER_TOKENS } from '@domain/user/tokens';
import { UserRepository } from '@infrastructure/user/repositories/UserRepository';
import { BcryptPasswordHasher } from '@infrastructure/user/services/BcryptPasswordHasher';
import { JwtTokenService } from '@infrastructure/user/services/JwtTokenService';
import { GoogleAuthService } from '@infrastructure/user/services/GoogleAuthService';
import { CloudinaryFileStorageService } from '@infrastructure/shared/services/CloudinaryFileStorageService';
import type { ISignUpUserUseCase } from '@application/user/use-cases/ISignUpUserUseCase';
import { SignUpUserUseCase } from '@application/user/use-cases/SignUpUserUseCase';
import type { ILoginUserUseCase } from '@application/user/use-cases/ILoginUserUseCase';
import { LoginUserUseCase } from '@application/user/use-cases/LoginUserUseCase';
import type { IGetCurrentUserUseCase } from '@application/user/use-cases/IGetCurrentUserUseCase';
import { GetCurrentUserUseCase } from '@application/user/use-cases/GetCurrentUserUseCase';
import type { ILoginWithGoogleUseCase } from '@application/user/use-cases/ILoginWithGoogleUseCase';
import { LoginWithGoogleUseCase } from '@application/user/use-cases/LoginWithGoogleUseCase';
import type { IUpdateNameUseCase } from '@application/user/use-cases/IUpdateNameUseCase';
import { UpdateNameUseCase } from '@application/user/use-cases/UpdateNameUseCase';
import type { IUpdatePhoneUseCase } from '@application/user/use-cases/IUpdatePhoneUseCase';
import { UpdatePhoneUseCase } from '@application/user/use-cases/UpdatePhoneUseCase';
import type { IRequestEmailChangeUseCase } from '@application/user/use-cases/IRequestEmailChangeUseCase';
import { RequestEmailChangeUseCase } from '@application/user/use-cases/RequestEmailChangeUseCase';
import type { IConfirmEmailChangeUseCase } from '@application/user/use-cases/IConfirmEmailChangeUseCase';
import { ConfirmEmailChangeUseCase } from '@application/user/use-cases/ConfirmEmailChangeUseCase';
import type { IChangePasswordUseCase } from '@application/user/use-cases/IChangePasswordUseCase';
import { ChangePasswordUseCase } from '@application/user/use-cases/ChangePasswordUseCase';
import type { ISetPasswordUseCase } from '@application/user/use-cases/ISetPasswordUseCase';
import { SetPasswordUseCase } from '@application/user/use-cases/SetPasswordUseCase';
import type { IUpdateAvatarUseCase } from '@application/user/use-cases/IUpdateAvatarUseCase';
import { UpdateAvatarUseCase } from '@application/user/use-cases/UpdateAvatarUseCase';
import type { IOtpRepository } from '@domain/otp/repositories/IOtpRepository';
import type { IOtpService } from '@domain/otp/services/IOtpService';
import type { IEmailService } from '@domain/otp/services/IEmailService';
import type { IOtpSessionTokenService } from '@domain/otp/services/IOtpSessionTokenService';
import { OTP_TOKENS } from '@domain/otp/tokens';
import { OtpRepository } from '@infrastructure/otp/repositories/OtpRepository';
import { OtpService } from '@infrastructure/otp/services/OtpService';
import { ResendEmailService } from '@infrastructure/otp/services/ResendEmailService';
import { JwtOtpSessionTokenService } from '@infrastructure/otp/services/JwtOtpSessionTokenService';
import type { ISendOtpUseCase } from '@application/otp/use-cases/ISendOtpUseCase';
import { SendOtpUseCase } from '@application/otp/use-cases/SendOtpUseCase';
import type { IVerifyOtpUseCase } from '@application/otp/use-cases/IVerifyOtpUseCase';
import { VerifyOtpUseCase } from '@application/otp/use-cases/VerifyOtpUseCase';
import type { IGetOtpSessionUseCase } from '@application/otp/use-cases/IGetOtpSessionUseCase';
import { GetOtpSessionUseCase } from '@application/otp/use-cases/GetOtpSessionUseCase';
import type { IPasswordResetTokenRepository } from '@domain/passwordReset/repositories/IPasswordResetTokenRepository';
import type { IPasswordResetTokenService } from '@domain/passwordReset/services/IPasswordResetTokenService';
import { PASSWORD_RESET_TOKENS } from '@domain/passwordReset/tokens';
import { PasswordResetTokenRepository } from '@infrastructure/passwordReset/repositories/PasswordResetTokenRepository';
import { PasswordResetTokenService } from '@infrastructure/passwordReset/services/PasswordResetTokenService';
import type { IRequestPasswordResetUseCase } from '@application/passwordReset/use-cases/IRequestPasswordResetUseCase';
import { RequestPasswordResetUseCase } from '@application/passwordReset/use-cases/RequestPasswordResetUseCase';
import type { IResetPasswordUseCase } from '@application/passwordReset/use-cases/IResetPasswordUseCase';
import { ResetPasswordUseCase } from '@application/passwordReset/use-cases/ResetPasswordUseCase';
import { ADMIN_TOKENS } from '@domain/admin/tokens';
import type { ISeedAdminUseCase } from '@application/admin/use-cases/ISeedAdminUseCase';
import { SeedAdminUseCase } from '@application/admin/use-cases/SeedAdminUseCase';
import type { IAdminLoginUseCase } from '@application/admin/use-cases/IAdminLoginUseCase';
import { AdminLoginUseCase } from '@application/admin/use-cases/AdminLoginUseCase';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import { SportsTypeRepository } from '@infrastructure/sportsType/repositories/SportsTypeRepository';
import type { IListSportsTypesUseCase } from '@application/sportsType/use-cases/IListSportsTypesUseCase';
import { ListSportsTypesUseCase } from '@application/sportsType/use-cases/ListSportsTypesUseCase';
import type { ICreateSportsTypeUseCase } from '@application/sportsType/use-cases/ICreateSportsTypeUseCase';
import { CreateSportsTypeUseCase } from '@application/sportsType/use-cases/CreateSportsTypeUseCase';
import type { IUpdateSportsTypeUseCase } from '@application/sportsType/use-cases/IUpdateSportsTypeUseCase';
import { UpdateSportsTypeUseCase } from '@application/sportsType/use-cases/UpdateSportsTypeUseCase';
import type { IToggleSportsTypeListedUseCase } from '@application/sportsType/use-cases/IToggleSportsTypeListedUseCase';
import { ToggleSportsTypeListedUseCase } from '@application/sportsType/use-cases/ToggleSportsTypeListedUseCase';
import type { IUploadSportsTypeIconUseCase } from '@application/sportsType/use-cases/IUploadSportsTypeIconUseCase';
import { UploadSportsTypeIconUseCase } from '@application/sportsType/use-cases/UploadSportsTypeIconUseCase';
import type { IAmenityRepository } from '@domain/amenity/repositories/IAmenityRepository';
import { AMENITY_TOKENS } from '@domain/amenity/tokens';
import { AmenityRepository } from '@infrastructure/amenity/repositories/AmenityRepository';
import type { IListAmenitiesUseCase } from '@application/amenity/use-cases/IListAmenitiesUseCase';
import { ListAmenitiesUseCase } from '@application/amenity/use-cases/ListAmenitiesUseCase';
import type { ICreateAmenityUseCase } from '@application/amenity/use-cases/ICreateAmenityUseCase';
import { CreateAmenityUseCase } from '@application/amenity/use-cases/CreateAmenityUseCase';
import type { IUpdateAmenityUseCase } from '@application/amenity/use-cases/IUpdateAmenityUseCase';
import { UpdateAmenityUseCase } from '@application/amenity/use-cases/UpdateAmenityUseCase';
import type { IToggleAmenityListedUseCase } from '@application/amenity/use-cases/IToggleAmenityListedUseCase';
import { ToggleAmenityListedUseCase } from '@application/amenity/use-cases/ToggleAmenityListedUseCase';
import type { IUploadAmenityIconUseCase } from '@application/amenity/use-cases/IUploadAmenityIconUseCase';
import { UploadAmenityIconUseCase } from '@application/amenity/use-cases/UploadAmenityIconUseCase';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import type { ITurfImageRepository } from '@domain/turf/repositories/ITurfImageRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import { TurfRepository } from '@infrastructure/turf/repositories/TurfRepository';
import { TurfImageRepository } from '@infrastructure/turf/repositories/TurfImageRepository';
import type { ITurfOwnerApplicationRepository } from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import { TurfOwnerApplicationRepository } from '@infrastructure/turfOwnerApplication/repositories/TurfOwnerApplicationRepository';
import type { ISubmitTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/ISubmitTurfOwnerApplicationUseCase';
import { SubmitTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/SubmitTurfOwnerApplicationUseCase';
import type { IGetMyTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/IGetMyTurfOwnerApplicationUseCase';
import { GetMyTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/GetMyTurfOwnerApplicationUseCase';
import type { IListMyTurfOwnerApplicationsUseCase } from '@application/turfOwnerApplication/use-cases/IListMyTurfOwnerApplicationsUseCase';
import { ListMyTurfOwnerApplicationsUseCase } from '@application/turfOwnerApplication/use-cases/ListMyTurfOwnerApplicationsUseCase';
import type { IListTurfOwnerApplicationsUseCase } from '@application/turfOwnerApplication/use-cases/IListTurfOwnerApplicationsUseCase';
import { ListTurfOwnerApplicationsUseCase } from '@application/turfOwnerApplication/use-cases/ListTurfOwnerApplicationsUseCase';
import type { IApproveTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/IApproveTurfOwnerApplicationUseCase';
import { ApproveTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/ApproveTurfOwnerApplicationUseCase';
import type { IRejectTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/IRejectTurfOwnerApplicationUseCase';
import { RejectTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/RejectTurfOwnerApplicationUseCase';

/** Composition root — wires domain interfaces to their infrastructure implementations. */
container.register<IUserRepository>(USER_TOKENS.UserRepository, { useClass: UserRepository });
container.register<IPasswordHasher>(USER_TOKENS.PasswordHasher, { useClass: BcryptPasswordHasher });
container.register<ITokenService>(USER_TOKENS.TokenService, { useClass: JwtTokenService });
container.register<IGoogleAuthService>(USER_TOKENS.GoogleAuthService, {
  useClass: GoogleAuthService,
});
container.register<IFileStorageService>(SHARED_TOKENS.FileStorageService, {
  useClass: CloudinaryFileStorageService,
});
container.register<ISignUpUserUseCase>(USER_TOKENS.SignUpUserUseCase, {
  useClass: SignUpUserUseCase,
});
container.register<ILoginUserUseCase>(USER_TOKENS.LoginUserUseCase, { useClass: LoginUserUseCase });
container.register<IGetCurrentUserUseCase>(USER_TOKENS.GetCurrentUserUseCase, {
  useClass: GetCurrentUserUseCase,
});
container.register<ILoginWithGoogleUseCase>(USER_TOKENS.LoginWithGoogleUseCase, {
  useClass: LoginWithGoogleUseCase,
});
container.register<IUpdateNameUseCase>(USER_TOKENS.UpdateNameUseCase, {
  useClass: UpdateNameUseCase,
});
container.register<IUpdatePhoneUseCase>(USER_TOKENS.UpdatePhoneUseCase, {
  useClass: UpdatePhoneUseCase,
});
container.register<IRequestEmailChangeUseCase>(USER_TOKENS.RequestEmailChangeUseCase, {
  useClass: RequestEmailChangeUseCase,
});
container.register<IConfirmEmailChangeUseCase>(USER_TOKENS.ConfirmEmailChangeUseCase, {
  useClass: ConfirmEmailChangeUseCase,
});
container.register<IChangePasswordUseCase>(USER_TOKENS.ChangePasswordUseCase, {
  useClass: ChangePasswordUseCase,
});
container.register<ISetPasswordUseCase>(USER_TOKENS.SetPasswordUseCase, {
  useClass: SetPasswordUseCase,
});
container.register<IUpdateAvatarUseCase>(USER_TOKENS.UpdateAvatarUseCase, {
  useClass: UpdateAvatarUseCase,
});
container.register<IOtpRepository>(OTP_TOKENS.OtpRepository, { useClass: OtpRepository });
container.register<IOtpService>(OTP_TOKENS.OtpService, { useClass: OtpService });
container.register<IEmailService>(OTP_TOKENS.EmailService, { useClass: ResendEmailService });
container.register<IOtpSessionTokenService>(OTP_TOKENS.OtpSessionTokenService, {
  useClass: JwtOtpSessionTokenService,
});
container.register<ISendOtpUseCase>(OTP_TOKENS.SendOtpUseCase, { useClass: SendOtpUseCase });
container.register<IVerifyOtpUseCase>(OTP_TOKENS.VerifyOtpUseCase, { useClass: VerifyOtpUseCase });
container.register<IGetOtpSessionUseCase>(OTP_TOKENS.GetOtpSessionUseCase, {
  useClass: GetOtpSessionUseCase,
});
container.register<IPasswordResetTokenRepository>(
  PASSWORD_RESET_TOKENS.PasswordResetTokenRepository,
  {
    useClass: PasswordResetTokenRepository,
  },
);
container.register<IPasswordResetTokenService>(PASSWORD_RESET_TOKENS.PasswordResetTokenService, {
  useClass: PasswordResetTokenService,
});
container.register<IRequestPasswordResetUseCase>(
  PASSWORD_RESET_TOKENS.RequestPasswordResetUseCase,
  {
    useClass: RequestPasswordResetUseCase,
  },
);
container.register<IResetPasswordUseCase>(PASSWORD_RESET_TOKENS.ResetPasswordUseCase, {
  useClass: ResetPasswordUseCase,
});
container.register<ISeedAdminUseCase>(ADMIN_TOKENS.SeedAdminUseCase, {
  useClass: SeedAdminUseCase,
});
container.register<IAdminLoginUseCase>(ADMIN_TOKENS.AdminLoginUseCase, {
  useClass: AdminLoginUseCase,
});
container.register<ISportsTypeRepository>(SPORTS_TYPE_TOKENS.SportsTypeRepository, {
  useClass: SportsTypeRepository,
});
container.register<IListSportsTypesUseCase>(SPORTS_TYPE_TOKENS.ListSportsTypesUseCase, {
  useClass: ListSportsTypesUseCase,
});
container.register<ICreateSportsTypeUseCase>(SPORTS_TYPE_TOKENS.CreateSportsTypeUseCase, {
  useClass: CreateSportsTypeUseCase,
});
container.register<IUpdateSportsTypeUseCase>(SPORTS_TYPE_TOKENS.UpdateSportsTypeUseCase, {
  useClass: UpdateSportsTypeUseCase,
});
container.register<IToggleSportsTypeListedUseCase>(
  SPORTS_TYPE_TOKENS.ToggleSportsTypeListedUseCase,
  { useClass: ToggleSportsTypeListedUseCase },
);
container.register<IUploadSportsTypeIconUseCase>(SPORTS_TYPE_TOKENS.UploadSportsTypeIconUseCase, {
  useClass: UploadSportsTypeIconUseCase,
});
container.register<IAmenityRepository>(AMENITY_TOKENS.AmenityRepository, {
  useClass: AmenityRepository,
});
container.register<IListAmenitiesUseCase>(AMENITY_TOKENS.ListAmenitiesUseCase, {
  useClass: ListAmenitiesUseCase,
});
container.register<ICreateAmenityUseCase>(AMENITY_TOKENS.CreateAmenityUseCase, {
  useClass: CreateAmenityUseCase,
});
container.register<IUpdateAmenityUseCase>(AMENITY_TOKENS.UpdateAmenityUseCase, {
  useClass: UpdateAmenityUseCase,
});
container.register<IToggleAmenityListedUseCase>(AMENITY_TOKENS.ToggleAmenityListedUseCase, {
  useClass: ToggleAmenityListedUseCase,
});
container.register<IUploadAmenityIconUseCase>(AMENITY_TOKENS.UploadAmenityIconUseCase, {
  useClass: UploadAmenityIconUseCase,
});
container.register<ITurfRepository>(TURF_TOKENS.TurfRepository, { useClass: TurfRepository });
container.register<ITurfImageRepository>(TURF_TOKENS.TurfImageRepository, {
  useClass: TurfImageRepository,
});
container.register<ITurfOwnerApplicationRepository>(
  TURF_OWNER_APPLICATION_TOKENS.TurfOwnerApplicationRepository,
  { useClass: TurfOwnerApplicationRepository },
);
container.register<ISubmitTurfOwnerApplicationUseCase>(
  TURF_OWNER_APPLICATION_TOKENS.SubmitTurfOwnerApplicationUseCase,
  { useClass: SubmitTurfOwnerApplicationUseCase },
);
container.register<IGetMyTurfOwnerApplicationUseCase>(
  TURF_OWNER_APPLICATION_TOKENS.GetMyTurfOwnerApplicationUseCase,
  { useClass: GetMyTurfOwnerApplicationUseCase },
);
container.register<IListMyTurfOwnerApplicationsUseCase>(
  TURF_OWNER_APPLICATION_TOKENS.ListMyTurfOwnerApplicationsUseCase,
  { useClass: ListMyTurfOwnerApplicationsUseCase },
);
container.register<IListTurfOwnerApplicationsUseCase>(
  TURF_OWNER_APPLICATION_TOKENS.ListTurfOwnerApplicationsUseCase,
  { useClass: ListTurfOwnerApplicationsUseCase },
);
container.register<IApproveTurfOwnerApplicationUseCase>(
  TURF_OWNER_APPLICATION_TOKENS.ApproveTurfOwnerApplicationUseCase,
  { useClass: ApproveTurfOwnerApplicationUseCase },
);
container.register<IRejectTurfOwnerApplicationUseCase>(
  TURF_OWNER_APPLICATION_TOKENS.RejectTurfOwnerApplicationUseCase,
  { useClass: RejectTurfOwnerApplicationUseCase },
);

export { container };
