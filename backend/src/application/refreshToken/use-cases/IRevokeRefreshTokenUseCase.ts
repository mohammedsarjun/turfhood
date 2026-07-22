export interface IRevokeRefreshTokenUseCase {
  /** Best-effort revoke — never throws, since logout must succeed even with a garbage/missing token. */
  execute(rawRefreshToken: string | undefined): Promise<void>;
}
