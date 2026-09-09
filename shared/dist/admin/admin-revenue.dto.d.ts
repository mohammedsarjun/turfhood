export interface AdminRevenueSummaryDTO {
    bookings: number;
    grossRevenuePaise: number;
    commissionPaise: number;
    ownerPayoutPaise: number;
    averageCommissionPercentage: number;
}
export interface AdminRevenueTrendDTO extends AdminRevenueSummaryDTO {
    date: string;
}
export interface AdminRevenueTransactionDTO {
    id: string;
    reference: string;
    bookingDate: string;
    turfName: string;
    customerName: string;
    bookingType: 'private' | 'open_session';
    grossRevenuePaise: number;
    commissionPaise: number;
    ownerPayoutPaise: number;
    commissionPercentage: number;
}
export interface AdminRevenueReportDTO {
    range: {
        startDate: string;
        endDate: string;
    };
    summary: AdminRevenueSummaryDTO;
    snapshots: {
        todayCommissionPaise: number;
        monthCommissionPaise: number;
        yearCommissionPaise: number;
    };
    bookingTypes: {
        private: number;
        openSession: number;
    };
    trend: AdminRevenueTrendDTO[];
    transactions: AdminRevenueTransactionDTO[];
}
