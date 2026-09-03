import { inject, injectable } from 'tsyringe';
import type { CreateReviewRequest, ReviewListResponse } from '@turfhood/shared';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import type { IReviewRepository } from '@domain/review/repositories/IReviewRepository';
import { ReviewActionError } from '@domain/review/errors/ReviewErrors';
import { REVIEW_TOKENS } from '@domain/review/tokens';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { IManageReviewsUseCase } from './IManageReviewsUseCase.js';

@injectable()
export class ManageReviewsUseCase implements IManageReviewsUseCase {
  constructor(
    @inject(REVIEW_TOKENS.Repository) private readonly reviews: IReviewRepository,
    @inject(BOOKING_TOKENS.Repository) private readonly bookings: IBookingRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
  ) {}

  async create(userId: string, bookingId: string, input: CreateReviewRequest) {
    const rating = Number(input.rating);
    const comment = typeof input.comment === 'string' ? input.comment.trim() : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      throw new ReviewActionError('Rating must be a whole number between 1 and 5.');
    if (comment.length < 3 || comment.length > 1000)
      throw new ReviewActionError('Comment must be between 3 and 1000 characters.');
    const booking = await this.bookings.findById(bookingId);
    if (!booking || booking.userId !== userId)
      throw new ReviewActionError('Only the customer who made this booking can review it.');
    if (booking.status !== 'completed')
      throw new ReviewActionError('A review can be added only after the booking is completed.');
    if (await this.reviews.findByBookingId(bookingId))
      throw new ReviewActionError('This booking has already been reviewed.');
    try {
      return await this.reviews.create({
        bookingId,
        userId,
        turfId: booking.turfId,
        courtId: booking.courtId,
        customerName: booking.customerName,
        turfName: booking.turfName,
        courtName: booking.courtName,
        rating,
        comment,
      });
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 11000)
        throw new ReviewActionError('This booking has already been reviewed.');
      throw error;
    }
  }

  async getMine(userId: string, bookingId: string) {
    const booking = await this.bookings.findById(bookingId);
    if (!booking || booking.userId !== userId)
      throw new ReviewActionError('Only the customer who made this booking can view its review.');
    return this.reviews.findByBookingId(bookingId);
  }

  async listPublic(turfId: string, page: number, limit: number) {
    if (!(await this.turfs.findApprovedById(turfId)))
      throw new ReviewActionError('Turf is not available.');
    return this.list(turfId, page, limit);
  }

  async listForOwner(ownerId: string, portalTurfId: string, page: number, limit: number) {
    const turf = await this.turfs.findOwnedByIdOrVerificationId(portalTurfId, ownerId);
    if (!turf?.id) throw new ReviewActionError('You do not have access to this turf.');
    return this.list(turf.id, page, limit);
  }

  private async list(turfId: string, page: number, limit: number): Promise<ReviewListResponse> {
    const result = await this.reviews.listByTurf(turfId, page, limit);
    return {
      items: result.items,
      summary: { average: result.average, count: result.total },
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  }
}
