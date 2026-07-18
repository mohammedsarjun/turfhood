import type { ResetPasswordRequestDTO } from '../dtos/ResetPasswordRequestDTO.js';
import type { ResetPasswordResponseDTO } from '../dtos/ResetPasswordResponseDTO.js';

export interface IResetPasswordUseCase {
  execute(request: ResetPasswordRequestDTO): Promise<ResetPasswordResponseDTO>;
}
