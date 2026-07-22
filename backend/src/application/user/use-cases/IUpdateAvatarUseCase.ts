import type { UpdateAvatarRequestDTO } from '../dtos/UpdateAvatarRequestDTO.js';
import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';

export interface IUpdateAvatarUseCase {
  execute(request: UpdateAvatarRequestDTO): Promise<UserResponseDTO>;
}
