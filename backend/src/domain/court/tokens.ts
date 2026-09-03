export const COURT_TOKENS = {
  CourtRepository: Symbol.for('CourtRepository'),
  CreateCourtUseCase: Symbol.for('CreateCourtUseCase'),
  ListCourtsUseCase: Symbol.for('ListCourtsUseCase'),
  ManageCourtDetailsUseCase: Symbol.for('ManageCourtDetailsUseCase'),
  GetPublicCourtDetailsUseCase: Symbol.for('GetPublicCourtDetailsUseCase'),
} as const;
