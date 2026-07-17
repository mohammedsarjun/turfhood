export type UserRole = 'customer' | 'admin' | 'turf_owner';
export type UserStatus = 'active' | 'suspended' | 'deleted';
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
}
