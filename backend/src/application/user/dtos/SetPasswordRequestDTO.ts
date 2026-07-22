import type { UserResponseDTO } from './UserResponseDTO.js';

export interface SetPasswordRequestDTO {
  userId: string;
  newPassword: string;
}

export interface SetPasswordResponseDTO {
  message: string;
  user: UserResponseDTO;
}
