import type { PaginationMeta } from '../common/pagination.js';
export type OpenSessionStatus = 'awaiting_creator_payment' | 'open' | 'full' | 'cancelled' | 'completed';
export interface OpenSessionParticipantDTO {
    userId: string;
    name: string;
    isCreator: boolean;
    paymentStatus: 'pending' | 'paid' | 'refund_pending' | 'refunded' | 'refund_failed';
    joinedAt: string;
}
export interface OpenSessionDTO {
    id: string;
    creatorId: string;
    turfId: string;
    courtId: string;
    turfName: string;
    courtName: string;
    courtImage?: string;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    sportTypeId: string;
    sportName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    minimumPlayers: number;
    maximumPlayers: number;
    joinedPlayers: number;
    totalPricePaise: number;
    pricePerParticipantPaise: number;
    status: OpenSessionStatus;
    fillDeadline: string;
    participants: OpenSessionParticipantDTO[];
    createdAt: string;
}
export interface CreateOpenSessionRequest {
    turfId: string;
    courtId: string;
    sportTypeId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    maximumPlayers: number;
}
export interface OpenSessionPaymentResponse {
    session: OpenSessionDTO;
    payment: {
        action: string;
        fields: Record<string, string>;
    };
}
export interface OpenSessionFilters {
    page?: number;
    limit?: number;
    sportTypeId?: string;
    latitude?: number;
    longitude?: number;
    nearMe?: boolean;
}
export interface OpenSessionListResponse {
    items: OpenSessionDTO[];
    pagination: PaginationMeta;
}
