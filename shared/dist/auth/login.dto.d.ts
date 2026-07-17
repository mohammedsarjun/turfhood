import type { PublicUser } from '../user/types.js';
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginSuccessResponse {
    status: 'success';
    user: PublicUser;
    accessToken: string;
}
export interface LoginNeedsVerificationResponse {
    status: 'needs_verification';
    email: string;
    message: string;
}
export type LoginResponse = LoginSuccessResponse | LoginNeedsVerificationResponse;
