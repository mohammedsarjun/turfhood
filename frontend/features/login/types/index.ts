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

export interface LoginSuccessResponse {
  status: 'success';
  user: LoginUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginNeedsVerificationResponse {
  status: 'needs_verification';
  email: string;
  message: string;
}

export type LoginResponse = LoginSuccessResponse | LoginNeedsVerificationResponse;
