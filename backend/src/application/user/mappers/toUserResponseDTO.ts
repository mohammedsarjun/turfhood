import type { User } from '@domain/user/entities/User';

import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';

export function toUserResponseDTO(user: User): UserResponseDTO {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email.toString(),
    phone: user.phone.toString(),
    roles: user.roles,
    isVerified: user.isVerified,
    status: user.status,
    createdAt: user.createdAt as Date,
  };
}
