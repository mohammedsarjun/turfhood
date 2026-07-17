import type { UserResponseDTO } from './UserResponseDTO.js';

export interface AuthResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
}
