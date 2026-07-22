import type { PublicUser } from '../user/types.js';
export interface AdminLoginRequest {
    email: string;
    password: string;
}
export interface AdminLoginResponse {
    admin: PublicUser;
    accessToken: string;
    refreshToken: string;
}
