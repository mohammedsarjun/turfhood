import type { UserResponseDTO } from '@application/user/dtos/UserResponseDTO';

export interface VerifyOtpResponseDTO {
  message: string;
  isVerified: true;
  user: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
}
