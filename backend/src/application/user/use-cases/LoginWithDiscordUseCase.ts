import { inject, injectable } from 'tsyringe';
import { User } from '@domain/user/entities/User';
import { AccountSuspendedError } from '@domain/user/errors/AccountSuspendedError';
import { InvalidCredentialsError } from '@domain/user/errors/InvalidCredentialsError';
import { DiscordEmailNotVerifiedError } from '@domain/user/errors/DiscordEmailNotVerifiedError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IDiscordAuthService } from '@domain/user/services/IDiscordAuthService';
import type { ITokenService } from '@domain/user/services/ITokenService';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import type { IRefreshTokenRepository } from '@domain/refreshToken/repositories/IRefreshTokenRepository';
import type { IRefreshTokenService } from '@domain/refreshToken/services/IRefreshTokenService';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';
import { issueRefreshToken } from '@application/refreshToken/issueRefreshToken';

import type { DiscordAuthRequestDTO } from '../dtos/DiscordAuthRequestDTO.js';
import type { DiscordAuthResponseDTO } from '../dtos/DiscordAuthResponseDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { ILoginWithDiscordUseCase } from './ILoginWithDiscordUseCase.js';

/**
 * Authenticates via Discord for both login and signup — finds or creates the user.
 * Existing email/password accounts get the Discord account linked.
 * Brand-new emails get a fresh user created and verified immediately.
 */
@injectable()
export class LoginWithDiscordUseCase implements ILoginWithDiscordUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.DiscordAuthService) private readonly discordAuthService: IDiscordAuthService,
    @inject(USER_TOKENS.TokenService) private readonly tokenService: ITokenService,
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenService)
    private readonly refreshTokenService: IRefreshTokenService,
  ) {}

  async execute(request: DiscordAuthRequestDTO): Promise<DiscordAuthResponseDTO> {
    const profile = await this.discordAuthService.verifyAndGetProfile(request.code, request.redirectUri);
    if (!profile.emailVerified) {
      throw new DiscordEmailNotVerifiedError();
    }

    const email = Email.create(profile.email);
    let user = await this.userRepository.findByEmail(email);

    if (user) {
      if (!user.discordId) {
        await this.userRepository.linkDiscordAccount(
          user.id as string,
          profile.discordId,
          profile.avatarUrl,
        );
        user = await this.userRepository.findById(user.id as string);
      }
    } else {
      const newUser = User.registerViaDiscord({
        name: profile.name,
        email,
        discordId: profile.discordId,
        ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
      });
      user = await this.userRepository.create(newUser);
    }

    if (!user) {
      throw new InvalidCredentialsError();
    }
    if (user.status === 'suspended') {
      throw new AccountSuspendedError(user.suspensionReason);
    }
    if (user.status === 'deleted') {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id as string,
      roles: user.roles,
    });
    const refreshToken = await issueRefreshToken(
      { id: user.id as string, roles: user.roles },
      this.refreshTokenService,
      this.refreshTokenRepository,
    );

    return { user: toUserResponseDTO(user), accessToken, refreshToken };
  }
}
