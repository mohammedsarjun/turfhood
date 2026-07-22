import type { VerifyOtpRequestDTO } from '../dtos/VerifyOtpRequestDTO.js';
import type { VerifyOtpResponseDTO } from '../dtos/VerifyOtpResponseDTO.js';

export interface IVerifyOtpUseCase {
  execute(request: VerifyOtpRequestDTO): Promise<VerifyOtpResponseDTO>;
}
