export interface AdminDashboardTrendDTO {
    month: string;
    label: string;
    bookings: number;
    revenuePaise: number;
}
export interface AdminDashboardRecentBookingDTO {
    id: string;
    reference: string;
    turfName: string;
    customerName: string;
    bookingDate: string;
    amountPaise: number;
    status: string;
    bookingType: "private" | "open_session";
}
export interface AdminDashboardDTO {
    totalCustomers: number;
    totalOwners: number;
    approvedTurfs: number;
    totalBookings: number;
    grossRevenuePaise: number;
    platformCommissionPaise: number;
    pendingApplications: number;
    escalatedRefunds: number;
    activeOpenSessions: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    trends: AdminDashboardTrendDTO[];
    recentBookings: AdminDashboardRecentBookingDTO[];
}
