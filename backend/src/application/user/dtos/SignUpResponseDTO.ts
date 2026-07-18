import type { UserResponseDTO } from './UserResponseDTO.js';

export interface SignUpResponseDTO {
  user: UserResponseDTO;
  expiresInSeconds: number;
}
