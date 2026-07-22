import { inject, injectable } from 'tsyringe';
import { OtpVerification } from '@domain/otp/entities/OtpVerification';
import type { IOtpRepository } from '@domain/otp/repositories/IOtpRepository';
import type { IEmailService } from '@domain/otp/services/IEmailService';
import type { IOtpService } from '@domain/otp/services/IOtpService';
import type { IOtpSessionTokenService } from '@domain/otp/services/IOtpSessionTokenService';
import { OTP_TOKENS } from '@domain/otp/tokens';
import { DuplicateEmailError } from '@domain/user/errors/DuplicateEmailError';
import { GoogleAccountEmailChangeNotAllowedError } from '@domain/user/errors/GoogleAccountEmailChangeNotAllowedError';
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import { env } from '@config/env';

import type {
  RequestEmailChangeRequestDTO,
  RequestEmailChangeResponseDTO,
} from '../dtos/RequestEmailChangeRequestDTO.js';

import type { IRequestEmailChangeUseCase } from './IRequestEmailChangeUseCase.js';

const PURPOSE = 'email_change' as const;

/**
 * Sends a verification code to a user's *new* email address. Deliberately not a reuse of
 * SendOtpUseCase — that use case resolves the target user by looking up the email it's sending
 * to, which is backwards here (the new email intentionally has no user yet). The underlying
 * services (IOtpService/IOtpRepository/IEmailService/IOtpSessionTokenService) are reused as-is.
 */
@injectable()
export class RequestEmailChangeUseCase implements IRequestEmailChangeUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(OTP_TOKENS.OtpRepository) private readonly otpRepository: IOtpRepository,
    @inject(OTP_TOKENS.OtpService) private readonly otpService: IOtpService,
    @inject(OTP_TOKENS.EmailService) private readonly emailService: IEmailService,
    @inject(OTP_TOKENS.OtpSessionTokenService)
    private readonly otpSessionTokenService: IOtpSessionTokenService,
  ) {}

  async execute(request: RequestEmailChangeRequestDTO): Promise<RequestEmailChangeResponseDTO> {
    const requestingUser = await this.userRepository.findById(request.userId);
    if (!requestingUser) {
      throw new UserNotFoundError();
    }
    if (requestingUser.authProviders.includes('google')) {
      throw new GoogleAccountEmailChangeNotAllowedError();
    }

    const newEmail = Email.create(request.newEmail);

    const existing = await this.userRepository.findByEmail(newEmail);
    if (existing) {
      throw new DuplicateEmailError(newEmail.toString());
    }

    await this.otpRepository.invalidateAllForEmail(newEmail, PURPOSE);

    const otp = this.otpService.generate();
    const otpHash = await this.otpService.hash(otp);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

    const entity = OtpVerification.issue({
      userId: request.userId,
      email: newEmail.toString(),
      purpose: PURPOSE,
      otpHash,
      expiresAt,
    });
    await this.otpRepository.create(entity);

    await this.emailService.sendOtpEmail({
      to: newEmail.toString(),
      otp,
      purpose: PURPOSE,
      expiresInSeconds: env.OTP_EXPIRY_SECONDS,
    });

    const otpSessionToken = this.otpSessionTokenService.generate(
      { email: newEmail.toString(), purpose: PURPOSE, codeExpiresAt: expiresAt.getTime() },
      env.OTP_SESSION_EXPIRY_SECONDS,
    );

    return {
      message: 'Verification code sent to your new email address.',
      expiresInSeconds: env.OTP_EXPIRY_SECONDS,
      otpSessionToken,
    };
  }
}
