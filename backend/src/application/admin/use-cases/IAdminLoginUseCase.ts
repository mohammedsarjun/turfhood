import type { AdminLoginRequestDTO, AdminLoginResponseDTO } from '../dtos/AdminLoginRequestDTO.js';

export interface IAdminLoginUseCase {
  execute(request: AdminLoginRequestDTO): Promise<AdminLoginResponseDTO>;
}
