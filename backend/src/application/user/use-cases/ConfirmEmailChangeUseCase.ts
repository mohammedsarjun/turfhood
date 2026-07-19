import { inject, injectable } from 'tsyringe';
import { OtpExpiredError } from '@domain/otp/errors/OtpExpiredError';
import { OtpInvalidError } from '@domain/otp/errors/OtpInvalidError';
import { OtpMaxAttemptsError } from '@domain/otp/errors/OtpMaxAttemptsError';
import { OtpNotFoundError } from '@domain/otp/errors/OtpNotFoundError';
import type { IOtpRepository } from '@domain/otp/repositories/IOtpRepository';
import type { IOtpService } from '@domain/otp/services/IOtpService';
import { OTP_TOKENS } from '@domain/otp/tokens';
import { DuplicateEmailError } from '@domain/user/errors/DuplicateEmailError';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import { env } from '@config/env';

import type {
  ConfirmEmailChangeRequestDTO,
  ConfirmEmailChangeResponseDTO,
} from '../dtos/ConfirmEmailChangeRequestDTO.js';
import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

import type { IConfirmEmailChangeUseCase } from './IConfirmEmailChangeUseCase.js';

const PURPOSE = 'email_change' as const;

/**
 * Verifies the code sent to a user's new email and, only on success, commits the email change.
 * The old email remains active until this succeeds — mirrors VerifyOtpUseCase's expiry/attempt
 * checks, but persists onto the *authenticated* user rather than marking a fresh signup verified.
 */
@injectable()
export class ConfirmEmailChangeUseCase implements IConfirmEmailChangeUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(OTP_TOKENS.OtpRepository) private readonly otpRepository: IOtpRepository,
    @inject(OTP_TOKENS.OtpService) private readonly otpService: IOtpService,
  ) {}

  async execute(
    request: ConfirmEmailChangeRequestDTO,
  ): Promise<ConfirmEmailChangeResponseDTO & { user: UserResponseDTO }> {
    const newEmail = Email.create(request.newEmail);

    const record = await this.otpRepository.findLatestActiveByEmail(newEmail, PURPOSE);
    if (!record || record.isConsumed() || record.userId !== request.userId) {
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

    const existing = await this.userRepository.findByEmail(newEmail);
    if (existing) {
      throw new DuplicateEmailError(newEmail.toString());
    }

    await this.otpRepository.markConsumed(record.id as string);
    await this.userRepository.updateEmail(request.userId, newEmail);

    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    return { message: 'Email updated successfully.', user: toUserResponseDTO(user) };
  }
}
