import { injectable } from 'tsyringe';
import { maskEmail } from '@turfhood/shared';
import type { OtpSessionClaims } from '@domain/otp/services/IOtpSessionTokenService';

import type { GetOtpSessionResponseDTO } from '../dtos/GetOtpSessionResponseDTO.js';

import type { IGetOtpSessionUseCase } from './IGetOtpSessionUseCase.js';

/** Maps a verified otpSession JWT's claims into the display-safe shape the OTP page renders from. */
@injectable()
export class GetOtpSessionUseCase implements IGetOtpSessionUseCase {
  execute(session: OtpSessionClaims): GetOtpSessionResponseDTO {
    return {
      maskedEmail: maskEmail(session.email),
      purpose: session.purpose,
      expiresAt: session.exp * 1000,
    };
  }
}
