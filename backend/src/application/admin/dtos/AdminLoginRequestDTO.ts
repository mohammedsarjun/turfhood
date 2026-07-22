import type { UserResponseDTO } from '@application/user/dtos/UserResponseDTO';

export interface AdminLoginRequestDTO {
  email: string;
  password: string;
}

export interface AdminLoginResponseDTO {
  admin: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
}
