/** DI tokens identifying the turfOwnerApplication module's ports, resolved by the composition root. */
export const TURF_OWNER_APPLICATION_TOKENS = {
  TurfOwnerApplicationRepository: Symbol('ITurfOwnerApplicationRepository'),
  SubmitTurfOwnerApplicationUseCase: Symbol('ISubmitTurfOwnerApplicationUseCase'),
  GetMyTurfOwnerApplicationUseCase: Symbol('IGetMyTurfOwnerApplicationUseCase'),
  ListMyTurfOwnerApplicationsUseCase: Symbol('IListMyTurfOwnerApplicationsUseCase'),
  ListTurfOwnerApplicationsUseCase: Symbol('IListTurfOwnerApplicationsUseCase'),
  ApproveTurfOwnerApplicationUseCase: Symbol('IApproveTurfOwnerApplicationUseCase'),
  RejectTurfOwnerApplicationUseCase: Symbol('IRejectTurfOwnerApplicationUseCase'),
} as const;
