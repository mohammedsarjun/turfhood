export interface SignUpRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type UserRole = 'customer' | 'admin' | 'turf_owner';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface SignUpUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: UserRole[];
  isVerified: boolean;
  status: UserStatus;
  createdAt: string;
}

export interface SignUpResponse {
  user: SignUpUser;
}
