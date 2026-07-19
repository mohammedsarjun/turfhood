export type UserRole = 'customer' | 'admin' | 'turf_owner';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type AuthProvider = 'email' | 'phone_otp' | 'google';
/** Safe, outward-facing shape of a User — shared by every frontend/backend auth response. */
export interface PublicUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    roles: UserRole[];
    isVerified: boolean;
    status: UserStatus;
    createdAt: string;
    avatarUrl?: string;
    /** Whether a password is set on the account (false for Google-only accounts). */
    hasPassword: boolean;
    authProviders: AuthProvider[];
}
