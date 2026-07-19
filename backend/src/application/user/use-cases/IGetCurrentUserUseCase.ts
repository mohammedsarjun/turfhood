import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';

export interface IGetCurrentUserUseCase {
  execute(userId: string): Promise<UserResponseDTO>;
}
