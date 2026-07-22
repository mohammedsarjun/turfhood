import { inject, injectable } from 'tsyringe';
import type { IRefreshTokenRepository } from '@domain/refreshToken/repositories/IRefreshTokenRepository';
import type { IRefreshTokenService } from '@domain/refreshToken/services/IRefreshTokenService';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';

import type { IRevokeRefreshTokenUseCase } from './IRevokeRefreshTokenUseCase.js';

@injectable()
export class RevokeRefreshTokenUseCase implements IRevokeRefreshTokenUseCase {
  constructor(
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenService)
    private readonly refreshTokenService: IRefreshTokenService,
  ) {}

  async execute(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;

    try {
      const payload = this.refreshTokenService.verify(rawRefreshToken);
      await this.refreshTokenRepository.revoke(payload.jti);
    } catch {
      // Malformed, expired, or already-revoked — logout still succeeds; there's nothing to undo.
    }
  }
}
