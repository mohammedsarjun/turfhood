import { inject, injectable } from 'tsyringe';
import type { TurfDashboardDTO } from '@turfhood/shared';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import type { IReviewRepository } from '@domain/review/repositories/IReviewRepository';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import { REVIEW_TOKENS } from '@domain/review/tokens';
import { COURT_TOKENS } from '@domain/court/tokens';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import type { IGetOwnerDashboardUseCase } from './IGetOwnerDashboardUseCase.js';

const DASHBOARD_FETCH_LIMIT = 1_000;

@injectable()
export class GetOwnerDashboardUseCase implements IGetOwnerDashboardUseCase {
  constructor(
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(BOOKING_TOKENS.Repository) private readonly bookings: IBookingRepository,
    @inject(REVIEW_TOKENS.Repository) private readonly reviews: IReviewRepository,
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
  ) {}

  async execute(ownerId: string, portalTurfId: string): Promise<TurfDashboardDTO> {
    const turf = await this.turfs.findOwnedByIdOrVerificationId(portalTurfId, ownerId);
    if (!turf?.id) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
    const [bookingResult, reviewResult, courtResult] = await Promise.all([
      this.bookings.listByTurf(turf.id, 1, DASHBOARD_FETCH_LIMIT),
      this.reviews.listByTurf(turf.id, 1, 3),
      this.courts.list({ turfId: turf.id, page: 1, limit: DASHBOARD_FETCH_LIMIT }),
    ]);
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const earningBookings = bookingResult.items.filter((booking) =>
      ['confirmed', 'completed'].includes(booking.status),
    );
    const completedBookings = bookingResult.items.filter(
      (booking) => booking.status === 'completed',
    );
    const todayBookings = earningBookings.filter((booking) => booking.bookingDate === today);
    const upcoming = bookingResult.items
      .filter((booking) => booking.status === 'confirmed' && booking.bookingDate >= today)
      .sort((a, b) =>
        `${a.bookingDate}${a.slots[0]?.startTime ?? ''}`.localeCompare(
          `${b.bookingDate}${b.slots[0]?.startTime ?? ''}`,
        ),
      )
      .slice(0, 5);
    return {
      turfName: turf.name,
      stats: {
        totalBookings: bookingResult.total,
        totalRevenuePaise: earningBookings.reduce(
          (sum, booking) => sum + booking.ownerEarningsPaise,
          0,
        ),
        availableBalancePaise: completedBookings.reduce(
          (sum, booking) => sum + booking.ownerEarningsPaise,
          0,
        ),
        averageRating: reviewResult.average,
        reviewCount: reviewResult.total,
      },
      today: {
        bookings: todayBookings.length,
        revenuePaise: todayBookings.reduce((sum, booking) => sum + booking.ownerEarningsPaise, 0),
      },
      courts: {
        total: courtResult.total,
        active: courtResult.items.filter((court) => court.status === 'active').length,
        attentionNeeded: courtResult.items.filter((court) => court.status !== 'active').length,
      },
      upcomingBookings: upcoming.map((booking) => ({
        id: booking.id,
        reference: booking.reference,
        customerName: booking.customerName,
        courtName: booking.courtName,
        bookingDate: booking.bookingDate,
        startTime: booking.slots[0]?.startTime ?? '',
        slotCount: booking.slots.length,
        ownerEarningsPaise: booking.ownerEarningsPaise,
        status: booking.status,
      })),
      recentReviews: reviewResult.items.map((review) => ({
        id: review.id,
        customerName: review.customerName,
        courtName: review.courtName,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
    };
  }
}
