import type { PublicUser } from '../user/types.js';

export interface SignUpRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignUpResponse {
  user: PublicUser;
  expiresInSeconds: number;
}
