import type { RequestPasswordResetRequestDTO } from '../dtos/RequestPasswordResetRequestDTO.js';
import type { RequestPasswordResetResponseDTO } from '../dtos/RequestPasswordResetResponseDTO.js';

export interface IRequestPasswordResetUseCase {
  execute(request: RequestPasswordResetRequestDTO): Promise<RequestPasswordResetResponseDTO>;
}
