import { inject, injectable } from 'tsyringe';
import type { IEmailService } from '@domain/otp/services/IEmailService';
import { OTP_TOKENS } from '@domain/otp/tokens';
import { PasswordResetToken } from '@domain/passwordReset/entities/PasswordResetToken';
import type { IPasswordResetTokenRepository } from '@domain/passwordReset/repositories/IPasswordResetTokenRepository';
import type { IPasswordResetTokenService } from '@domain/passwordReset/services/IPasswordResetTokenService';
import { PASSWORD_RESET_TOKENS } from '@domain/passwordReset/tokens';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import { env } from '@config/env';

import type { RequestPasswordResetRequestDTO } from '../dtos/RequestPasswordResetRequestDTO.js';
import type { RequestPasswordResetResponseDTO } from '../dtos/RequestPasswordResetResponseDTO.js';

const GENERIC_MESSAGE = 'If an account exists for this email, a password reset link has been sent.';

/**
 * Issues a password-reset link for an existing user and emails it.
 * Never reveals whether the email is registered: an unknown email takes no
 * action (no token, no email) and still returns the exact same response as
 * a known one, so this endpoint can't be used to enumerate accounts.
 */
@injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(PASSWORD_RESET_TOKENS.PasswordResetTokenRepository)
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @inject(PASSWORD_RESET_TOKENS.PasswordResetTokenService)
    private readonly passwordResetTokenService: IPasswordResetTokenService,
    @inject(OTP_TOKENS.EmailService) private readonly emailService: IEmailService,
  ) {}

  async execute(request: RequestPasswordResetRequestDTO): Promise<RequestPasswordResetResponseDTO> {
    const email = Email.create(request.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { message: GENERIC_MESSAGE };
    }

    await this.passwordResetTokenRepository.invalidateAllForUser(user.id as string);

    const rawToken = this.passwordResetTokenService.generateToken();
    const tokenHash = this.passwordResetTokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_EXPIRY_SECONDS * 1000);

    const entity = PasswordResetToken.issue({ userId: user.id as string, tokenHash, expiresAt });
    await this.passwordResetTokenRepository.create(entity);

    const resetLink = `${env.FRONTEND_URL}/change-password?token=${rawToken}`;
    await this.emailService.sendPasswordResetEmail({
      to: email.toString(),
      resetLink,
      expiresInSeconds: env.PASSWORD_RESET_TOKEN_EXPIRY_SECONDS,
    });

    return { message: GENERIC_MESSAGE };
  }
}
