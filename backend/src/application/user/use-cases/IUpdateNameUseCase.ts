import type { UpdateNameRequestDTO } from '../dtos/UpdateNameRequestDTO.js';
import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';

export interface IUpdateNameUseCase {
  execute(request: UpdateNameRequestDTO): Promise<UserResponseDTO>;
}
