import type { UserResponseDTO } from './UserResponseDTO.js';

export interface GoogleAuthResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
}
