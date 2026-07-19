import { inject, injectable } from 'tsyringe';
import { OtpExpiredError } from '@domain/otp/errors/OtpExpiredError';
import { OtpInvalidError } from '@domain/otp/errors/OtpInvalidError';
import { OtpMaxAttemptsError } from '@domain/otp/errors/OtpMaxAttemptsError';
import { OtpNotFoundError } from '@domain/otp/errors/OtpNotFoundError';
import type { IOtpRepository } from '@domain/otp/repositories/IOtpRepository';
import type { IOtpService } from '@domain/otp/services/IOtpService';
import { OTP_TOKENS } from '@domain/otp/tokens';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { ITokenService } from '@domain/user/services/ITokenService';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import { env } from '@config/env';
import { toUserResponseDTO } from '@application/user/mappers/toUserResponseDTO';

import type { VerifyOtpRequestDTO } from '../dtos/VerifyOtpRequestDTO.js';
import type { VerifyOtpResponseDTO } from '../dtos/VerifyOtpResponseDTO.js';

import type { IVerifyOtpUseCase } from './IVerifyOtpUseCase.js';

/**
 * Validates a submitted OTP and, on success, marks the user verified and
 * issues an access token — matching what LoginUserUseCase does on success,
 * so the frontend can log the user in immediately after verification.
 */
@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(OTP_TOKENS.OtpRepository) private readonly otpRepository: IOtpRepository,
    @inject(OTP_TOKENS.OtpService) private readonly otpService: IOtpService,
    @inject(USER_TOKENS.TokenService) private readonly tokenService: ITokenService,
  ) {}

  async execute(request: VerifyOtpRequestDTO): Promise<VerifyOtpResponseDTO> {
    const email = Email.create(request.email);

    const record = await this.otpRepository.findLatestActiveByEmail(email, request.purpose);
    if (!record || record.isConsumed()) {
      throw new OtpNotFoundError();
    }

    if (record.isExpired(new Date())) {
      throw new OtpExpiredError();
    }

    if (record.hasExceededMaxAttempts(env.OTP_MAX_ATTEMPTS)) {
      throw new OtpMaxAttemptsError();
    }

    const isValid = await this.otpService.compare(request.otp, record.otpHash);
    if (!isValid) {
      await this.otpRepository.incrementAttemptCount(record.id as string);
      throw new OtpInvalidError();
    }

    await this.otpRepository.markConsumed(record.id as string);
    await this.userRepository.markVerified(email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id as string,
      roles: user.roles,
    });

    return {
      message: 'Email verified successfully.',
      isVerified: true,
      user: toUserResponseDTO(user),
      accessToken,
    };
  }
}
