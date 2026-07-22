/** DI tokens identifying the refresh-token module's ports, resolved by the composition root. */
export const REFRESH_TOKEN_TOKENS = {
  RefreshTokenRepository: Symbol('IRefreshTokenRepository'),
  RefreshTokenService: Symbol('IRefreshTokenService'),
  RefreshAccessTokenUseCase: Symbol('IRefreshAccessTokenUseCase'),
  RevokeRefreshTokenUseCase: Symbol('IRevokeRefreshTokenUseCase'),
} as const;
