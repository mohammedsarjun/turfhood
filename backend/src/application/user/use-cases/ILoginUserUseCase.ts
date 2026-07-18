import type { LoginResponseDTO } from '../dtos/LoginResponseDTO.js';
import type { LoginUserRequestDTO } from '../dtos/LoginUserRequestDTO.js';

export interface ILoginUserUseCase {
  execute(request: LoginUserRequestDTO): Promise<LoginResponseDTO>;
}
