import { inject, injectable } from 'tsyringe';
import { toUserResponseDTO } from '@application/user/mappers/toUserResponseDTO';
import { InvalidAdminCredentialsError } from '@domain/admin/errors/InvalidAdminCredentialsError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import type { ITokenService } from '@domain/user/services/ITokenService';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';

import type { AdminLoginRequestDTO, AdminLoginResponseDTO } from '../dtos/AdminLoginRequestDTO.js';

import type { IAdminLoginUseCase } from './IAdminLoginUseCase.js';

/**
 * Validates admin credentials against the seeded User record (roles: ['admin']) and issues
 * a token through the same ITokenService used for regular login — reused as-is, no parallel
 * token system. Structural separation from regular sessions happens at the cookie layer
 * (see presentation/admin/utils/adminAuthCookie.ts), not in the token shape itself.
 */
@injectable()
export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
    @inject(USER_TOKENS.TokenService) private readonly tokenService: ITokenService,
  ) {}

  async execute(request: AdminLoginRequestDTO): Promise<AdminLoginResponseDTO> {
    const email = Email.create(request.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidAdminCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.compare(request.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidAdminCredentialsError();
    }

    if (!user.roles.includes('admin')) {
      throw new InvalidAdminCredentialsError();
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id as string,
      roles: user.roles,
    });

    return { admin: toUserResponseDTO(user), accessToken };
  }
}
