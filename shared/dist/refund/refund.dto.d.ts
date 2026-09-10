import type { PaginationMeta } from "../common/pagination.js";
export type CustomerRefundStatus = "pending" | "failed" | "escalated" | "refunded" | "partially_refunded";
export interface CustomerRefundDTO {
    id: string;
    source: "booking" | "open_session";
    reference: string;
    turfName: string;
    courtName: string;
    amountPaise: number;
    status: CustomerRefundStatus;
    reason: string;
    attemptCount: number;
    escalated: boolean;
    paymentReference?: string;
    refundReference?: string;
    requestedAt?: string;
    completedAt?: string;
    failureReason?: string;
    createdAt: string;
}
export interface CustomerRefundListResponse {
    items: CustomerRefundDTO[];
    pagination: PaginationMeta;
}
