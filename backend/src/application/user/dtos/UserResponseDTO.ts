import type { UserRole, UserStatus } from '@domain/user/entities/User';

/** Safe, outward-facing shape of a User — never includes passwordHash. */
export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: UserRole[];
  isVerified: boolean;
  status: UserStatus;
  createdAt: Date;
}
