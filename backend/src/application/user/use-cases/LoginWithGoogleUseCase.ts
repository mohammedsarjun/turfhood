import { inject, injectable } from 'tsyringe';
import { User } from '@domain/user/entities/User';
import { AccountSuspendedError } from '@domain/user/errors/AccountSuspendedError';
import { InvalidCredentialsError } from '@domain/user/errors/InvalidCredentialsError';
import { GoogleEmailNotVerifiedError } from '@domain/user/errors/GoogleEmailNotVerifiedError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IGoogleAuthService } from '@domain/user/services/IGoogleAuthService';
import type { ITokenService } from '@domain/user/services/ITokenService';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import type { IRefreshTokenRepository } from '@domain/refreshToken/repositories/IRefreshTokenRepository';
import type { IRefreshTokenService } from '@domain/refreshToken/services/IRefreshTokenService';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';
import { issueRefreshToken } from '@application/refreshToken/issueRefreshToken';

import type { GoogleAuthRequestDTO } from '../dtos/GoogleAuthRequestDTO.js';
import type { GoogleAuthResponseDTO } from '../dtos/GoogleAuthResponseDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { ILoginWithGoogleUseCase } from './ILoginWithGoogleUseCase.js';

/**
 * Authenticates via Google for both login and signup — the two are indistinguishable from
 * Google's perspective, so this single use case finds-or-creates the user: an existing
 * email/password account gets the Google account linked (not duplicated), a brand-new email
 * gets a fresh user created and immediately verified (Google already proved email ownership,
 * so this deliberately skips the OTP flow SignUpUserUseCase would otherwise trigger).
 */
@injectable()
export class LoginWithGoogleUseCase implements ILoginWithGoogleUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.GoogleAuthService) private readonly googleAuthService: IGoogleAuthService,
    @inject(USER_TOKENS.TokenService) private readonly tokenService: ITokenService,
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenService)
    private readonly refreshTokenService: IRefreshTokenService,
  ) {}

  async execute(request: GoogleAuthRequestDTO): Promise<GoogleAuthResponseDTO> {

    const profile = await this.googleAuthService.verifyAndGetProfile(request.code);
    if (!profile.emailVerified) {
      throw new GoogleEmailNotVerifiedError();
    }

    const email = Email.create(profile.email);
    let user = await this.userRepository.findByEmail(email);

    if (user) {
      if (!user.googleId) {
        await this.userRepository.linkGoogleAccount(
          user.id as string,
          profile.googleId,
          profile.avatarUrl,
        );
        user = await this.userRepository.findById(user.id as string);
      }
    } else {
      const newUser = User.registerViaGoogle({
        name: profile.name,
        email,
        googleId: profile.googleId,
        ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
      });
      user = await this.userRepository.create(newUser);
    }

    if (!user) {
      throw new InvalidCredentialsError();
    }
    if (user.status === 'suspended') {
      throw new AccountSuspendedError();
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
