import { inject, injectable } from 'tsyringe';
import { AccountSuspendedError } from '@domain/user/errors/AccountSuspendedError';
import { InvalidCredentialsError } from '@domain/user/errors/InvalidCredentialsError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import type { ITokenService } from '@domain/user/services/ITokenService';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import type { IRefreshTokenRepository } from '@domain/refreshToken/repositories/IRefreshTokenRepository';
import type { IRefreshTokenService } from '@domain/refreshToken/services/IRefreshTokenService';
import { REFRESH_TOKEN_TOKENS } from '@domain/refreshToken/tokens';
import { issueRefreshToken } from '@application/refreshToken/issueRefreshToken';

import type { LoginResponseDTO } from '../dtos/LoginResponseDTO.js';
import type { LoginUserRequestDTO } from '../dtos/LoginUserRequestDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { ILoginUserUseCase } from './ILoginUserUseCase.js';

/**
 * Orchestrates credential verification and access-token issuance for an existing user.
 * Deliberately does not trigger the login OTP itself — the presentation layer
 * (frontend) is responsible for calling /otp/send once it sees needs_verification,
 * keeping this use case a pure "can this user log in?" decision.
 */
@injectable()
export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
    @inject(USER_TOKENS.TokenService) private readonly tokenService: ITokenService,
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @inject(REFRESH_TOKEN_TOKENS.RefreshTokenService)
    private readonly refreshTokenService: IRefreshTokenService,
  ) {}

  async execute(request: LoginUserRequestDTO): Promise<LoginResponseDTO> {
    const email = Email.create(request.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.compare(request.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    if (user.status === 'suspended') {
      throw new AccountSuspendedError();
    }
    if (user.status === 'deleted') {
      throw new InvalidCredentialsError();
    }

    if (!user.isVerified) {
      return {
        status: 'needs_verification',
        email: email.toString(),
        message: 'Please verify your email to continue.',
      };
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

    return { status: 'success', user: toUserResponseDTO(user), accessToken, refreshToken };
  }
}
