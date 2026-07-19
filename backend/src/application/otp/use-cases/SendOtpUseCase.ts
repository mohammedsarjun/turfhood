import { inject, injectable } from 'tsyringe';
import { OtpVerification } from '@domain/otp/entities/OtpVerification';
import type { IOtpRepository } from '@domain/otp/repositories/IOtpRepository';
import type { IEmailService } from '@domain/otp/services/IEmailService';
import type { IOtpService } from '@domain/otp/services/IOtpService';
import type { IOtpSessionTokenService } from '@domain/otp/services/IOtpSessionTokenService';
import { OTP_TOKENS } from '@domain/otp/tokens';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import { env } from '@config/env';

import type { SendOtpRequestDTO } from '../dtos/SendOtpRequestDTO.js';
import type { SendOtpResponseDTO } from '../dtos/SendOtpResponseDTO.js';

import type { ISendOtpUseCase } from './ISendOtpUseCase.js';

/**
 * Issues a fresh OTP for a user and emails it.
 * Reused as-is for both the initial "send" and any later "resend" — invalidating
 * prior active codes before issuing a new one already satisfies "resend invalidates
 * the previous OTP", so no separate resend use-case is needed.
 */
@injectable()
export class SendOtpUseCase implements ISendOtpUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(OTP_TOKENS.OtpRepository) private readonly otpRepository: IOtpRepository,
    @inject(OTP_TOKENS.OtpService) private readonly otpService: IOtpService,
    @inject(OTP_TOKENS.EmailService) private readonly emailService: IEmailService,
    @inject(OTP_TOKENS.OtpSessionTokenService)
    private readonly otpSessionTokenService: IOtpSessionTokenService,
  ) {}

  async execute(request: SendOtpRequestDTO): Promise<SendOtpResponseDTO> {
    const email = Email.create(request.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }

    await this.otpRepository.invalidateAllForEmail(email, request.purpose);

    const otp = this.otpService.generate();
    const otpHash = await this.otpService.hash(otp);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

    const entity = OtpVerification.issue({
      userId: user.id as string,
      email: email.toString(),
      purpose: request.purpose,
      otpHash,
      expiresAt,
    });
    await this.otpRepository.create(entity);

    await this.emailService.sendOtpEmail({
      to: email.toString(),
      otp,
      purpose: request.purpose,
      expiresInSeconds: env.OTP_EXPIRY_SECONDS,
    });

    const otpSessionToken = this.otpSessionTokenService.generate(
      { email: email.toString(), purpose: request.purpose },
      env.OTP_EXPIRY_SECONDS,
    );

    return {
      message: 'Verification code sent.',
      expiresInSeconds: env.OTP_EXPIRY_SECONDS,
      otpSessionToken,
    };
  }
}
