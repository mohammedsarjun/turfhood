export interface RevenueSummaryDTO {
    bookings: number;
    grossRevenuePaise: number;
    commissionPaise: number;
    netEarningsPaise: number;
}
export interface RevenueTrendPointDTO extends RevenueSummaryDTO {
    date: string;
}
export interface RevenueTransactionDTO {
    id: string;
    reference: string;
    bookingDate: string;
    customerName: string;
    courtName: string;
    grossRevenuePaise: number;
    commissionPaise: number;
    netEarningsPaise: number;
}
export interface TurfRevenueReportDTO {
    pagination?: import("../common/pagination.js").PaginationMeta;
    turfName: string;
    selectedRange: {
        startDate: string;
        endDate: string;
        summary: RevenueSummaryDTO;
    };
    snapshots: {
        today: RevenueSummaryDTO;
        last7Days: RevenueSummaryDTO;
        thisMonth: RevenueSummaryDTO;
    };
    trend: RevenueTrendPointDTO[];
    bookingStatus: {
        booked: number;
        cancelled: number;
        completed: number;
    };
    transactions: RevenueTransactionDTO[];
}
