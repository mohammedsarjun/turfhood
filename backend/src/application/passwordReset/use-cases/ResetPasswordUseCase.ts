import { inject, injectable } from 'tsyringe';
import { ResetTokenAlreadyUsedError } from '@domain/passwordReset/errors/ResetTokenAlreadyUsedError';
import { ResetTokenExpiredError } from '@domain/passwordReset/errors/ResetTokenExpiredError';
import { ResetTokenInvalidError } from '@domain/passwordReset/errors/ResetTokenInvalidError';
import type { IPasswordResetTokenRepository } from '@domain/passwordReset/repositories/IPasswordResetTokenRepository';
import type { IPasswordResetTokenService } from '@domain/passwordReset/services/IPasswordResetTokenService';
import { PASSWORD_RESET_TOKENS } from '@domain/passwordReset/tokens';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import { USER_TOKENS } from '@domain/user/tokens';
import { Password } from '@domain/user/value-objects/Password';

import type { IResetPasswordUseCase } from './IResetPasswordUseCase.js';
import type { ResetPasswordRequestDTO } from '../dtos/ResetPasswordRequestDTO.js';
import type { ResetPasswordResponseDTO } from '../dtos/ResetPasswordResponseDTO.js';

/**
 * Validates a password-reset token and, on success, updates the user's
 * password and consumes the token (and any other outstanding tokens for
 * that user, so a second unused link can't still be redeemed afterward).
 */
@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(PASSWORD_RESET_TOKENS.PasswordResetTokenRepository)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @inject(PASSWORD_RESET_TOKENS.PasswordResetTokenService)
    private readonly passwordResetTokenService: IPasswordResetTokenService,
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(request: ResetPasswordRequestDTO): Promise<ResetPasswordResponseDTO> {
    const tokenHash = this.passwordResetTokenService.hashToken(request.token);

    const record = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);
    if (!record) {
      throw new ResetTokenInvalidError();
    }

    if (record.isConsumed()) {
      throw new ResetTokenAlreadyUsedError();
    }

    if (record.isExpired(new Date())) {
      throw new ResetTokenExpiredError();
    }

    const password = Password.create(request.newPassword);
    const passwordHash = await this.passwordHasher.hash(password.getPlainValue());

    await this.userRepository.updatePassword(record.userId, passwordHash);
    await this.passwordResetTokenRepository.markConsumed(record.id as string);
    await this.passwordResetTokenRepository.invalidateAllForUser(record.userId);

    return { message: 'Password has been reset successfully.' };
  }
}
