import type { BookingStatus } from '../booking/booking.dto.js';
export interface TurfDashboardBookingDTO {
    id: string;
    reference: string;
    customerName: string;
    courtName: string;
    bookingDate: string;
    startTime: string;
    slotCount: number;
    ownerEarningsPaise: number;
    status: BookingStatus;
}
export interface TurfDashboardReviewDTO {
    id: string;
    customerName: string;
    courtName: string;
    rating: number;
    comment: string;
    createdAt: string;
}
export interface TurfDashboardDTO {
    turfName: string;
    stats: {
        totalBookings: number;
        totalRevenuePaise: number;
        availableBalancePaise: number;
        averageRating: number;
        reviewCount: number;
    };
    today: {
        bookings: number;
        revenuePaise: number;
    };
    courts: {
        total: number;
        active: number;
        attentionNeeded: number;
    };
    upcomingBookings: TurfDashboardBookingDTO[];
    recentReviews: TurfDashboardReviewDTO[];
}
