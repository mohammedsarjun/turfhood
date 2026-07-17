export interface LoginRequest {
  email: string;
  password: string;
}

export type UserRole = 'customer' | 'admin' | 'turf_owner';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface LoginUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  isVerified: boolean;
  status: UserStatus;
  createdAt: string;
}

export interface LoginResponse {
  user: LoginUser;
  accessToken: string;
}
