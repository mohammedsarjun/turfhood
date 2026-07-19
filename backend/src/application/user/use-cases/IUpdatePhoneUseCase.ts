import type { UpdatePhoneRequestDTO } from '../dtos/UpdatePhoneRequestDTO.js';
import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';

export interface IUpdatePhoneUseCase {
  execute(request: UpdatePhoneRequestDTO): Promise<UserResponseDTO>;
}
