export interface RefreshAccessTokenResultDTO {
  accessToken: string;
  refreshToken: string;
  roles: string[];
}

export interface IRefreshAccessTokenUseCase {
  execute(rawRefreshToken: string): Promise<RefreshAccessTokenResultDTO>;
}
