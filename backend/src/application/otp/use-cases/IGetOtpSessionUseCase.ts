import type { OtpSessionClaims } from '@domain/otp/services/IOtpSessionTokenService';

import type { GetOtpSessionResponseDTO } from '../dtos/GetOtpSessionResponseDTO.js';

export interface IGetOtpSessionUseCase {
  execute(session: OtpSessionClaims): GetOtpSessionResponseDTO;
}
