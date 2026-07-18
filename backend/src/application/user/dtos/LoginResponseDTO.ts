import type { UserResponseDTO } from './UserResponseDTO.js';

export type LoginResponseDTO =
  | { status: 'success'; user: UserResponseDTO; accessToken: string }
  | { status: 'needs_verification'; email: string; message: string };
