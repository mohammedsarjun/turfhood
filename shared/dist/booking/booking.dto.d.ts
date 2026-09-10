export type BookingStatus = "pending_payment" | "confirmed" | "payment_failed" | "cancelled_by_user" | "cancelled_by_owner" | "expired" | "completed" | "refunded" | "partially_refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refund_pending" | "refund_failed" | "refund_escalated" | "refunded" | "partially_refunded";
export type BookingTimelineEventType = "booking_created" | "payment_confirmed" | "payment_failed" | "booking_completed" | "booking_cancelled" | "refund_initiated" | "refund_failed" | "refund_escalated" | "refund_completed" | "refund_verified";
export interface BookingTimelineEventDTO {
    type: BookingTimelineEventType;
    description: string;
    occurredAt: string;
    actor?: "system" | "customer" | "owner" | "admin";
    attempt?: number;
}
export interface BookingSlotDTO {
    startTime: string;
    endTime: string;
    pricePaise: number;
}
export interface BookingDTO {
    id: string;
    reference: string;
    userId: string;
    turfId: string;
    courtId: string;
    bookingDate: string;
    slots: BookingSlotDTO[];
    turfName: string;
    courtName: string;
    address: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    subtotalPaise: number;
    discountPaise: number;
    taxPaise: number;
    platformFeePaise: number;
    commissionPercentage: number;
    commissionPaise: number;
    ownerEarningsPaise: number;
    finalAmountPaise: number;
    currency: "INR";
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    reservationExpiresAt?: string;
    paymentId?: string;
    refund?: {
        requestToken: string;
        payuRequestId?: string;
        requestedAt?: string;
        lastCheckedAt?: string;
        completedAt?: string;
        failureReason?: string;
        attemptCount: number;
    };
    timeline: BookingTimelineEventDTO[];
    cancellation?: {
        actor: "customer" | "owner";
        reason?: string;
        cancelledAt: string;
        refundPaise: number;
    };
    cancellationPolicy: {
        graceMinutes: number;
        fullRefundBeforeHours: number;
        partialRefundBeforeHours: number;
        partialRefundPercentage: number;
    };
    createdAt: string;
    confirmedAt?: string;
    bookingType?: "private" | "open_session";
    openSessionId?: string;
    participantUserIds?: string[];
    customerSharePaise?: number;
}
export interface CreateReservationRequest {
    turfId: string;
    courtId: string;
    bookingDate: string;
    slots: Array<{
        startTime: string;
        endTime: string;
    }>;
}
export interface CreateReservationResponse {
    booking: BookingDTO;
    payment: {
        action: string;
        fields: Record<string, string>;
    };
}
export interface CancelBookingRequest {
    reason?: string;
}
export interface BookingListResponse {
    items: BookingDTO[];
    pagination: import("../common/pagination.js").PaginationMeta;
}
