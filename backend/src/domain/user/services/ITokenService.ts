import type { UserRole } from '../entities/User.js';

export interface AuthTokenPayload {
  userId: string;
  roles: UserRole[];
}

export interface ITokenService {
  generateAccessToken(payload: AuthTokenPayload): string;
}
