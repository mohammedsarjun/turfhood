import type { UserResponseDTO } from './UserResponseDTO.js';

export interface DiscordAuthResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
}
