import { RefreshToken } from '@domain/refreshToken/entities/RefreshToken';
import type { IRefreshTokenRepository } from '@domain/refreshToken/repositories/IRefreshTokenRepository';
import type { IRefreshTokenService } from '@domain/refreshToken/services/IRefreshTokenService';
import type { UserRole } from '@domain/user/entities/User';

/** Issues a refresh token JWT and persists its revocation record — shared by every login flow. */
export async function issueRefreshToken(
  user: { id: string; roles: UserRole[] },
  refreshTokenService: IRefreshTokenService,
  refreshTokenRepository: IRefreshTokenRepository,
): Promise<string> {
  const issued = refreshTokenService.generate({ userId: user.id, roles: user.roles });
  await refreshTokenRepository.create(
    RefreshToken.issue({ userId: user.id, jti: issued.jti, expiresAt: issued.expiresAt }),
  );
  return issued.token;
}
