import type { SendOtpRequestDTO } from '../dtos/SendOtpRequestDTO.js';
import type { SendOtpResponseDTO } from '../dtos/SendOtpResponseDTO.js';

export interface ISendOtpUseCase {
  execute(request: SendOtpRequestDTO): Promise<SendOtpResponseDTO>;
}
