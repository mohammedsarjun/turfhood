import 'reflect-metadata';
import { container } from 'tsyringe';
import type { IBannerRepository } from '@domain/banner/repositories/IBannerRepository';
import { BANNER_TOKENS } from '@domain/banner/tokens';
import { BannerRepository } from '@infrastructure/banner/repositories/BannerRepository';
import type { IManageBannersUseCase } from '@application/banner/use-cases/IManageBannersUseCase';
import { ManageBannersUseCase } from '@application/banner/use-cases/ManageBannersUseCase';
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
import type { IAdminDashboardRepository } from '@domain/admin/repositories/IAdminDashboardRepository';
import { AdminDashboardRepository } from '@infrastructure/admin/repositories/AdminDashboardRepository';
import type { IGetAdminDashboardUseCase } from '@application/admin/use-cases/IGetAdminDashboardUseCase';
import { GetAdminDashboardUseCase } from '@application/admin/use-cases/GetAdminDashboardUseCase';
import type { IGetAdminRevenueUseCase } from '@application/admin/use-cases/IGetAdminRevenueUseCase';
import { GetAdminRevenueUseCase } from '@application/admin/use-cases/GetAdminRevenueUseCase';
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
import { ListNearbyTurfsUseCase } from '@application/turf/use-cases/ListNearbyTurfsUseCase';
import { GetTurfDetailsUseCase } from '@application/turf/use-cases/GetTurfDetailsUseCase';
import type { IListNearbyTurfsUseCase } from '@application/turf/use-cases/IListNearbyTurfsUseCase';
import type { IGetTurfDetailsUseCase } from '@application/turf/use-cases/IGetTurfDetailsUseCase';
import type { IGetOwnerDashboardUseCase } from '@application/turf/use-cases/IGetOwnerDashboardUseCase';
import { GetOwnerDashboardUseCase } from '@application/turf/use-cases/GetOwnerDashboardUseCase';
import type { IGetOwnerRevenueUseCase } from '@application/turf/use-cases/IGetOwnerRevenueUseCase';
import { GetOwnerRevenueUseCase } from '@application/turf/use-cases/GetOwnerRevenueUseCase';
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
import type { ILocationLookupService } from '@domain/location/services/ILocationLookupService';
import { LOCATION_TOKENS } from '@domain/location/tokens';
import { CountryStateCityLocationLookupService } from '@infrastructure/location/services/CountryStateCityLocationLookupService';
import type { IListCountriesUseCase } from '@application/location/use-cases/IListCountriesUseCase';
import { ListCountriesUseCase } from '@application/location/use-cases/ListCountriesUseCase';
import type { IListStatesUseCase } from '@application/location/use-cases/IListStatesUseCase';
import { ListStatesUseCase } from '@application/location/use-cases/ListStatesUseCase';
import type { IListCitiesUseCase } from '@application/location/use-cases/IListCitiesUseCase';
import { ListCitiesUseCase } from '@application/location/use-cases/ListCitiesUseCase';
import type { IRefreshTokenRepository } from '@domain/refreshToken/repositories/IRefreshTokenRepository';
import type { IRefreshTokenService } from '@domain/refreshToken/services/IRefreshTokenService';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';
import { RefreshTokenRepository } from '@infrastructure/refreshToken/repositories/RefreshTokenRepository';
import { JwtRefreshTokenService } from '@infrastructure/refreshToken/services/JwtRefreshTokenService';
import type { IRefreshAccessTokenUseCase } from '@application/refreshToken/use-cases/IRefreshAccessTokenUseCase';
import { RefreshAccessTokenUseCase } from '@application/refreshToken/use-cases/RefreshAccessTokenUseCase';
import type { IRevokeRefreshTokenUseCase } from '@application/refreshToken/use-cases/IRevokeRefreshTokenUseCase';
import { RevokeRefreshTokenUseCase } from '@application/refreshToken/use-cases/RevokeRefreshTokenUseCase';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { COURT_TOKENS } from '@domain/court/tokens';
import { CourtRepository } from '@infrastructure/court/repositories/CourtRepository';
import type { ICreateCourtUseCase } from '@application/court/use-cases/ICreateCourtUseCase';
import { CreateCourtUseCase } from '@application/court/use-cases/CreateCourtUseCase';
import type { IListCourtsUseCase } from '@application/court/use-cases/IListCourtsUseCase';
import { ListCourtsUseCase } from '@application/court/use-cases/ListCourtsUseCase';
import type { IManageCourtDetailsUseCase } from '@application/court/use-cases/IManageCourtDetailsUseCase';
import { ManageCourtDetailsUseCase } from '@application/court/use-cases/ManageCourtDetailsUseCase';
import type { IGetPublicCourtDetailsUseCase } from '@application/court/use-cases/IGetPublicCourtDetailsUseCase';
import { GetPublicCourtDetailsUseCase } from '@application/court/use-cases/GetPublicCourtDetailsUseCase';
import type { ICommissionSettingRepository } from '@domain/commission/repositories/ICommissionSettingRepository';
import { COMMISSION_TOKENS } from '@domain/commission/tokens';
import { CommissionSettingRepository } from '@infrastructure/commission/repositories/CommissionSettingRepository';
import type { IManageCommissionSettingUseCase } from '@application/commission/use-cases/IManageCommissionSettingUseCase';
import { ManageCommissionSettingUseCase } from '@application/commission/use-cases/ManageCommissionSettingUseCase';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import type { IPaymentService } from '@domain/booking/services/IPaymentService';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import { BookingRepository } from '@infrastructure/booking/repositories/BookingRepository';
import { PayUPaymentService } from '@infrastructure/booking/services/PayUPaymentService';
import type { IManageBookingsUseCase } from '@application/booking/use-cases/IManageBookingsUseCase';
import { ManageBookingsUseCase } from '@application/booking/use-cases/ManageBookingsUseCase';
import type { IReviewRepository } from '@domain/review/repositories/IReviewRepository';
import { REVIEW_TOKENS } from '@domain/review/tokens';
import { ReviewRepository } from '@infrastructure/review/repositories/ReviewRepository';
import type { IManageReviewsUseCase } from '@application/review/use-cases/IManageReviewsUseCase';
import { ManageReviewsUseCase } from '@application/review/use-cases/ManageReviewsUseCase';
import type { IFavoriteRepository } from '@domain/favorite/repositories/IFavoriteRepository';
import { FAVORITE_TOKENS } from '@domain/favorite/tokens';
import { FavoriteRepository } from '@infrastructure/favorite/repositories/FavoriteRepository';
import type { IManageFavoritesUseCase } from '@application/favorite/use-cases/IManageFavoritesUseCase';
import { ManageFavoritesUseCase } from '@application/favorite/use-cases/ManageFavoritesUseCase';
import type { IOpenSessionRepository } from '@domain/openSession/repositories/IOpenSessionRepository';
import { OPEN_SESSION_TOKENS } from '@domain/openSession/tokens';
import { OpenSessionRepository } from '@infrastructure/openSession/repositories/OpenSessionRepository';
import type { IManageOpenSessionsUseCase } from '@application/openSession/use-cases/IManageOpenSessionsUseCase';
import { ManageOpenSessionsUseCase } from '@application/openSession/use-cases/ManageOpenSessionsUseCase';

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
container.register<IAdminDashboardRepository>(ADMIN_TOKENS.DashboardRepository, {
  useClass: AdminDashboardRepository,
});
container.register<IGetAdminDashboardUseCase>(ADMIN_TOKENS.DashboardUseCase, {
  useClass: GetAdminDashboardUseCase,
});
container.register<IGetAdminRevenueUseCase>(ADMIN_TOKENS.RevenueUseCase, {
  useClass: GetAdminRevenueUseCase,
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
container.register<IListNearbyTurfsUseCase>(TURF_TOKENS.ListNearbyTurfsUseCase, {
  useClass: ListNearbyTurfsUseCase,
});
container.register<IGetTurfDetailsUseCase>(TURF_TOKENS.GetTurfDetailsUseCase, {
  useClass: GetTurfDetailsUseCase,
});
container.register<IGetOwnerDashboardUseCase>(TURF_TOKENS.GetOwnerDashboardUseCase, {
  useClass: GetOwnerDashboardUseCase,
});
container.register<IGetOwnerRevenueUseCase>(TURF_TOKENS.GetOwnerRevenueUseCase, {
  useClass: GetOwnerRevenueUseCase,
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
container.register<ILocationLookupService>(LOCATION_TOKENS.LocationLookupService, {
  useClass: CountryStateCityLocationLookupService,
});
container.register<IListCountriesUseCase>(LOCATION_TOKENS.ListCountriesUseCase, {
  useClass: ListCountriesUseCase,
});
container.register<IListStatesUseCase>(LOCATION_TOKENS.ListStatesUseCase, {
  useClass: ListStatesUseCase,
});
container.register<IListCitiesUseCase>(LOCATION_TOKENS.ListCitiesUseCase, {
  useClass: ListCitiesUseCase,
});
container.register<IRefreshTokenRepository>(REFRESH_TOKEN_TOKENS.RefreshTokenRepository, {
  useClass: RefreshTokenRepository,
});
container.register<IRefreshTokenService>(REFRESH_TOKEN_TOKENS.RefreshTokenService, {
  useClass: JwtRefreshTokenService,
});
container.register<IRefreshAccessTokenUseCase>(REFRESH_TOKEN_TOKENS.RefreshAccessTokenUseCase, {
  useClass: RefreshAccessTokenUseCase,
});
container.register<IRevokeRefreshTokenUseCase>(REFRESH_TOKEN_TOKENS.RevokeRefreshTokenUseCase, {
  useClass: RevokeRefreshTokenUseCase,
});
container.register<ICourtRepository>(COURT_TOKENS.CourtRepository, { useClass: CourtRepository });
container.register<IBannerRepository>(BANNER_TOKENS.BannerRepository, {
  useClass: BannerRepository,
});
container.register<IManageBannersUseCase>(BANNER_TOKENS.ManageBannersUseCase, {
  useClass: ManageBannersUseCase,
});
container.register<ICreateCourtUseCase>(COURT_TOKENS.CreateCourtUseCase, {
  useClass: CreateCourtUseCase,
});
container.register<IListCourtsUseCase>(COURT_TOKENS.ListCourtsUseCase, {
  useClass: ListCourtsUseCase,
});
container.register<IManageCourtDetailsUseCase>(COURT_TOKENS.ManageCourtDetailsUseCase, {
  useClass: ManageCourtDetailsUseCase,
});
container.register<IGetPublicCourtDetailsUseCase>(COURT_TOKENS.GetPublicCourtDetailsUseCase, {
  useClass: GetPublicCourtDetailsUseCase,
});
container.register<ICommissionSettingRepository>(COMMISSION_TOKENS.Repository, {
  useClass: CommissionSettingRepository,
});
container.register<IManageCommissionSettingUseCase>(COMMISSION_TOKENS.UseCase, {
  useClass: ManageCommissionSettingUseCase,
});
container.register<IBookingRepository>(BOOKING_TOKENS.Repository, { useClass: BookingRepository });
container.register<IPaymentService>(BOOKING_TOKENS.Payment, { useClass: PayUPaymentService });
container.register<IManageBookingsUseCase>(BOOKING_TOKENS.UseCase, {
  useClass: ManageBookingsUseCase,
});
container.register<IReviewRepository>(REVIEW_TOKENS.Repository, { useClass: ReviewRepository });
container.register<IManageReviewsUseCase>(REVIEW_TOKENS.UseCase, {
  useClass: ManageReviewsUseCase,
});
container.register<IFavoriteRepository>(FAVORITE_TOKENS.Repository, {
  useClass: FavoriteRepository,
});
container.register<IManageFavoritesUseCase>(FAVORITE_TOKENS.UseCase, {
  useClass: ManageFavoritesUseCase,
});
container.register<IOpenSessionRepository>(OPEN_SESSION_TOKENS.Repository, {
  useClass: OpenSessionRepository,
});
container.register<IManageOpenSessionsUseCase>(OPEN_SESSION_TOKENS.UseCase, {
  useClass: ManageOpenSessionsUseCase,
});

export { container };
