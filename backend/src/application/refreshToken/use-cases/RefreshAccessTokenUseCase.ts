import { inject, injectable } from 'tsyringe';
import { RefreshToken } from '@domain/refreshToken/entities/RefreshToken';
import { RefreshTokenInvalidError } from '@domain/refreshToken/errors/RefreshTokenInvalidError';
import type { IRefreshTokenRepository } from '@domain/refreshToken/repositories/IRefreshTokenRepository';
import type { IRefreshTokenService } from '@domain/refreshToken/services/IRefreshTokenService';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { ITokenService } from '@domain/user/services/ITokenService';
import { USER_TOKENS } from '@domain/user/tokens';

import type {
  IRefreshAccessTokenUseCase,
  RefreshAccessTokenResultDTO,
} from './IRefreshAccessTokenUseCase.js';

/**
 * Verifies + rotates a refresh token: the presented token's `jti` is revoked and a brand-new
 * refresh token (and access token) is issued in its place. If the `jti` is unknown or already
 * revoked, the token has been reused (e.g. stolen and replayed after the legitimate rotation) —
 * every refresh token for that user is revoked, forcing a full re-login rather than trusting it.
 */
@injectable()
export class RefreshAccessTokenUseCase implements IRefreshAccessTokenUseCase {
  constructor(
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenService)
    private readonly refreshTokenService: IRefreshTokenService,
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.TokenService) private readonly tokenService: ITokenService,
  ) {}

  async execute(rawRefreshToken: string): Promise<RefreshAccessTokenResultDTO> {
    const payload = this.refreshTokenService.verify(rawRefreshToken);

    const existing = await this.refreshTokenRepository.findByJti(payload.jti);
    if (!existing || existing.isRevoked() || existing.isExpired(new Date())) {
      await this.refreshTokenRepository.revokeAllForUser(payload.userId);
      throw new RefreshTokenInvalidError();
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user || user.status !== 'active') {
      await this.refreshTokenRepository.revokeAllForUser(payload.userId);
      throw new RefreshTokenInvalidError();
    }

    const issued = this.refreshTokenService.generate({ userId: user.id as string, roles: user.roles });
    await this.refreshTokenRepository.revoke(payload.jti, issued.jti);
    await this.refreshTokenRepository.create(
      RefreshToken.issue({ userId: user.id as string, jti: issued.jti, expiresAt: issued.expiresAt }),
    );

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id as string,
      roles: user.roles,
    });

    return { accessToken, refreshToken: issued.token, roles: user.roles };
  }
}
