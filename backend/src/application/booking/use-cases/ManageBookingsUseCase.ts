import { randomUUID } from 'node:crypto';
import { inject, injectable } from 'tsyringe';
import type {
  BookingDTO,
  BookingListResponse,
  CreateReservationRequest,
  CreateReservationResponse,
} from '@turfhood/shared';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import type { IPaymentService, PaymentCallback } from '@domain/booking/services/IPaymentService';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import { BookingActionError, BookingNotFoundError } from '@domain/booking/errors/BookingErrors';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { COURT_TOKENS } from '@domain/court/tokens';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import type { ICommissionSettingRepository } from '@domain/commission/repositories/ICommissionSettingRepository';
import { COMMISSION_TOKENS } from '@domain/commission/tokens';
import { generateSlots } from '@application/court/use-cases/GetPublicCourtDetailsUseCase';
import { DEFAULT_COMMISSION_PERCENTAGE } from '@application/commission/constants';
import type { IEmailService } from '@domain/otp/services/IEmailService';
import { OTP_TOKENS } from '@domain/otp/tokens';
import type { IManageBookingsUseCase } from './IManageBookingsUseCase.js';
import { calculateCustomerRefundPaise } from '@domain/booking/services/BookingPolicy';

const HOLD_MINUTES = 10;
const MAX_REFUND_ATTEMPTS = 3;
const playTime = (date: string, time: string) => new Date(`${date}T${time}:00+05:30`);
const indiaDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

@injectable()
export class ManageBookingsUseCase implements IManageBookingsUseCase {
  constructor(
    @inject(BOOKING_TOKENS.Repository) private readonly bookings: IBookingRepository,
    @inject(BOOKING_TOKENS.Payment) private readonly payments: IPaymentService,
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(USER_TOKENS.UserRepository) private readonly users: IUserRepository,
    @inject(COMMISSION_TOKENS.Repository)
    private readonly commissions: ICommissionSettingRepository,
    @inject(OTP_TOKENS.EmailService) private readonly emails: IEmailService,
  ) {}
  async reserve(
    userId: string,
    input: CreateReservationRequest,
  ): Promise<CreateReservationResponse> {
    if (!input.slots.length || input.slots.length > 12)
      throw new BookingActionError('Select between 1 and 12 slots.');
    const uniqueSlots = new Set(input.slots.map((slot) => `${slot.startTime}-${slot.endTime}`));
    if (uniqueSlots.size !== input.slots.length)
      throw new BookingActionError('The same slot cannot be selected twice.');
    const today = indiaDate(new Date());
    const lastBookingDate = indiaDate(new Date(Date.now() + 13 * 24 * 60 * 60_000));
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(input.bookingDate) ||
      input.bookingDate < today ||
      input.bookingDate > lastBookingDate
    )
      throw new BookingActionError('Bookings are available only for the next 14 days.');
    const [court, turf, user, override, commission] = await Promise.all([
      this.courts.findByIdAndTurf(input.courtId, input.turfId),
      this.turfs.findApprovedById(input.turfId),
      this.users.findById(userId),
      this.courts
        .listOverrides(input.courtId)
        .then((items) => items.find((item) => item.date === input.bookingDate)),
      this.commissions.get(),
    ]);
    if (!court || court.status !== 'active' || !turf || !user)
      throw new BookingActionError('Court is not available.');
    if (!user.phone)
      throw new BookingActionError('Add a phone number to your profile before booking.');
    const parsedDate = new Date(`${input.bookingDate}T00:00:00Z`);
    const day = parsedDate.getUTCDay();
    const available = new Map(
      generateSlots(
        court,
        input.bookingDate,
        day === 0 || day === 6 ? 'weekend' : 'weekday',
        override,
      ).map((slot) => [`${slot.startTime}-${slot.endTime}`, slot]),
    );
    const selected = input.slots.map((slot) => available.get(`${slot.startTime}-${slot.endTime}`));
    if (selected.some((slot) => !slot))
      throw new BookingActionError('One or more selected slots are unavailable.');
    if (
      input.slots.some(
        (slot) => playTime(input.bookingDate, slot.startTime).getTime() <= Date.now(),
      )
    )
      throw new BookingActionError('Past slots cannot be booked.');
    const subtotalPaise = selected.reduce((sum, slot) => sum + Math.round(slot!.price * 100), 0);
    const basisPoints = commission?.basisPoints ?? DEFAULT_COMMISSION_PERCENTAGE * 100;
    const commissionPaise = Math.round((subtotalPaise * basisPoints) / 10_000);
    const expires = new Date(Date.now() + HOLD_MINUTES * 60_000);
    const transactionId = randomUUID().replaceAll('-', '').slice(0, 25);
    const booking = await this.bookings.reserve({
      reference: `TH-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`,
      userId,
      turfId: input.turfId,
      courtId: input.courtId,
      bookingDate: input.bookingDate,
      slots: selected.map((slot) => ({
        startTime: slot!.startTime,
        endTime: slot!.endTime,
        pricePaise: Math.round(slot!.price * 100),
      })),
      turfName: turf.name,
      courtName: court.name,
      address: [
        turf.address.line1,
        turf.address.city,
        turf.address.state,
        turf.address.pincode,
      ].join(', '),
      customerName: user.name,
      customerEmail: user.email.toString(),
      customerPhone: user.phone.toString(),
      subtotalPaise,
      discountPaise: 0,
      taxPaise: 0,
      platformFeePaise: 0,
      commissionBasisPoints: basisPoints,
      commissionPaise,
      ownerEarningsPaise: subtotalPaise - commissionPaise,
      finalAmountPaise: subtotalPaise,
      currency: 'INR',
      status: 'pending_payment',
      paymentStatus: 'pending',
      timeline: [
        {
          type: 'booking_created',
          description: 'Booking created and payment reservation started.',
          occurredAt: new Date().toISOString(),
          actor: 'customer',
        },
      ],
      cancellationPolicy: {
        graceMinutes: 10,
        fullRefundBeforeHours: 24,
        partialRefundBeforeHours: 6,
        partialRefundPercentage: 50,
      },
      reservationExpiresAt: expires,
      payuTransactionId: transactionId,
    });
    return { booking, payment: this.payments.createForm(booking, transactionId) };
  }
  async paymentCallback(input: PaymentCallback): Promise<BookingDTO> {
    const booking = await this.bookings.findByTransactionId(input.txnid);
    if (!booking) throw new BookingNotFoundError();
    if (
      !this.payments.verifyCallback(input) ||
      Math.round(Number(input.amount) * 100) !== booking.finalAmountPaise ||
      input.status !== 'success'
    ) {
      await this.bookings.fail(booking.id);
      throw new BookingActionError('Payment verification failed.');
    }
    const paymentId = input.mihpayid ?? input.txnid;
    if (
      booking.status === 'expired' ||
      booking.status === 'payment_failed' ||
      (booking.reservationExpiresAt && new Date(booking.reservationExpiresAt) <= new Date())
    ) {
      const expired = await this.bookings.markLatePaymentForRefund(booking.id, paymentId);
      if (expired) await this.initiateRefund(expired, booking.finalAmountPaise);
      throw new BookingActionError(
        expired
          ? 'Reservation expired. The late payment is being refunded.'
          : 'Reservation expired before payment confirmation.',
      );
    }
    const result = await this.bookings.confirm(booking.id, paymentId);
    if (!result) throw new BookingNotFoundError();
    if (result.newlyConfirmed) {
      await this.bookings.appendTimeline(booking.id, {
        type: 'payment_confirmed',
        description: 'Payment confirmed and booking secured.',
        actor: 'system',
      });
      try {
        await this.emails.sendBookingConfirmationEmail({
          to: result.booking.customerEmail,
          reference: result.booking.reference,
          turfName: result.booking.turfName,
          courtName: result.booking.courtName,
          date: result.booking.bookingDate,
          times: result.booking.slots.map((slot) => `${slot.startTime}-${slot.endTime}`).join(', '),
          amount: `INR ${(result.booking.finalAmountPaise / 100).toFixed(2)}`,
          address: result.booking.address,
        });
      } catch (error) {
        console.error('Booking confirmation email failed.', error);
      }
    }
    return result.booking;
  }
  async listMine(userId: string, page: number, limit: number): Promise<BookingListResponse> {
    await this.bookings.completePast(new Date());
    const result = await this.bookings.listByUser(userId, page, limit);
    return {
      items: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  }
  async getMine(userId: string, id: string) {
    await this.bookings.completePast(new Date());
    const booking = await this.bookings.findById(id);
    if (!booking || booking.userId !== userId) throw new BookingNotFoundError();
    return booking;
  }
  async retryPayment(userId: string, id: string): Promise<CreateReservationResponse> {
    const booking = await this.getMine(userId, id);
    if (booking.status !== 'payment_failed' && booking.status !== 'expired') {
      throw new BookingActionError('Only failed or expired payments can be retried.');
    }
    return this.reserve(userId, {
      turfId: booking.turfId,
      courtId: booking.courtId,
      bookingDate: booking.bookingDate,
      slots: booking.slots.map(({ startTime, endTime }) => ({ startTime, endTime })),
    });
  }
  async cancelMine(userId: string, id: string, reason?: string) {
    const booking = await this.getMine(userId, id);
    if (booking.status !== 'confirmed' || !booking.confirmedAt)
      throw new BookingActionError('Only confirmed bookings can be cancelled.');
    const refundPaise = calculateCustomerRefundPaise({
      paidPaise: booking.finalAmountPaise,
      confirmedAt: new Date(booking.confirmedAt),
      startsAt: playTime(booking.bookingDate, booking.slots[0]!.startTime),
      now: new Date(),
    });
    const refundToken = refundPaise ? `refund-${booking.id.slice(-16)}` : undefined;
    const cancelled = await this.bookings.cancel(id, 'customer', reason, refundPaise, refundToken);
    if (!cancelled) throw new BookingActionError('Booking can no longer be cancelled.');
    const minutesAfterConfirmation = Math.max(
      0,
      Math.floor((Date.now() - new Date(booking.confirmedAt).getTime()) / 60_000),
    );
    const refundPercent = Math.round((refundPaise / booking.finalAmountPaise) * 100);
    const withinGrace = Date.now() - new Date(booking.confirmedAt).getTime() <= 10 * 60_000;
    const hoursBeforePlay =
      (playTime(booking.bookingDate, booking.slots[0]!.startTime).getTime() - Date.now()) /
      (60 * 60_000);
    const policyReason = withinGrace
      ? 'cancelled within the 10-minute grace period'
      : hoursBeforePlay >= 24
        ? 'cancelled at least 24 hours before play'
        : hoursBeforePlay >= 6
          ? 'cancelled between 6 and 24 hours before play'
          : 'cancelled less than 6 hours before play';
    await this.bookings.appendTimeline(cancelled.id, {
      type: 'booking_cancelled',
      description: refundPaise
        ? `Booking ${policyReason} (${minutesAfterConfirmation} minute(s) after confirmation); ${refundPercent}% refund applies.`
        : `Booking ${policyReason}; cancellation policy provides no refund.`,
      actor: 'customer',
    });
    if (refundPaise && booking.paymentId) {
      try {
        return await this.initiateRefund(cancelled, refundPaise);
      } catch (error) {
        await this.bookings.recordRefundFailure(
          cancelled.id,
          error instanceof Error ? error.message : 'Refund initiation failed.',
          MAX_REFUND_ATTEMPTS,
        );
      }
    }
    return (await this.bookings.findById(cancelled.id)) ?? cancelled;
  }
  async listForOwner(ownerId: string, portalTurfId: string, page: number, limit: number) {
    await this.bookings.completePast(new Date());
    const turf = await this.turfs.findOwnedByIdOrVerificationId(portalTurfId, ownerId);
    if (!turf?.id) throw new BookingNotFoundError();
    const result = await this.bookings.listByTurf(turf.id, page, limit);
    return {
      items: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  }
  async cancelForOwner(ownerId: string, portalTurfId: string, id: string, reason?: string) {
    const turf = await this.turfs.findOwnedByIdOrVerificationId(portalTurfId, ownerId);
    const booking = await this.bookings.findById(id);
    if (!turf?.id || !booking || booking.turfId !== turf.id) throw new BookingNotFoundError();
    const cancelled = await this.bookings.cancel(
      id,
      'owner',
      reason,
      booking.finalAmountPaise,
      `refund-${booking.id.slice(-16)}`,
    );
    if (!cancelled) throw new BookingActionError('Booking can no longer be cancelled.');
    await this.bookings.appendTimeline(cancelled.id, {
      type: 'booking_cancelled',
      description: 'Turf owner cancelled the booking; 100% refund applies.',
      actor: 'owner',
    });
    if (booking.paymentId) {
      try {
        return await this.initiateRefund(cancelled, booking.finalAmountPaise);
      } catch (error) {
        await this.bookings.recordRefundFailure(
          cancelled.id,
          error instanceof Error ? error.message : 'Refund initiation failed.',
          MAX_REFUND_ATTEMPTS,
        );
      }
    }
    return (await this.bookings.findById(cancelled.id)) ?? cancelled;
  }

  async reconcileRefunds(limit = 50): Promise<number> {
    const pending = await this.bookings.listPendingRefunds(limit);
    let completed = 0;
    for (const pendingBooking of pending) {
      try {
        const booking = pendingBooking.refund?.requestToken
          ? pendingBooking
          : ((await this.bookings.prepareRefund(
              pendingBooking.id,
              `refund-${pendingBooking.id.slice(-16)}`,
            )) ?? pendingBooking);
        if (!booking.refund?.payuRequestId) {
          if (booking.paymentId && booking.refund?.requestToken) {
            const existing = await this.payments.findRefund(
              booking.paymentId,
              booking.refund.requestToken,
            );
            if (existing) {
              if (existing.requestId)
                await this.bookings.markRefundRequested(booking.id, existing.requestId);
              if (existing.status === 'success') {
                if (await this.bookings.markRefundCompleted(booking.id)) completed += 1;
              } else if (existing.status === 'failed') {
                await this.bookings.recordRefundFailure(
                  booking.id,
                  existing.reason ?? `PayU reported ${existing.providerStatus}.`,
                  MAX_REFUND_ATTEMPTS,
                );
              } else {
                await this.bookings.markRefundChecked(booking.id);
              }
              continue;
            }
          }
          const amount = booking.cancellation?.refundPaise ?? booking.finalAmountPaise;
          await this.initiateRefund(booking, amount);
          continue;
        }
        const result = await this.payments.checkRefund(booking.refund.payuRequestId);
        if (result.status === 'success') {
          if (await this.bookings.markRefundCompleted(booking.id)) completed += 1;
        } else if (result.status === 'failed') {
          await this.bookings.recordRefundFailure(
            booking.id,
            result.reason ?? `PayU reported ${result.providerStatus}.`,
            MAX_REFUND_ATTEMPTS,
          );
        } else {
          await this.bookings.markRefundChecked(booking.id);
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Refund reconciliation failed.';
        if (pendingBooking.refund?.payuRequestId)
          await this.bookings.markRefundChecked(pendingBooking.id, reason);
        else
          await this.bookings.recordRefundFailure(
            pendingBooking.id,
            reason,
            MAX_REFUND_ATTEMPTS,
          );
      }
    }
    return completed;
  }
  async abandonCheckout(userId: string, bookingId: string): Promise<void> {
    await this.bookings.abandonPending(bookingId, userId);
  }

  async listEscalatedRefunds(page: number, limit: number): Promise<BookingListResponse> {
    const result = await this.bookings.listEscalatedRefunds(page, limit);
    return {
      items: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / limit)),
      },
    };
  }

  async verifyManualRefund(bookingId: string, payuRequestId: string): Promise<BookingDTO> {
    const booking = await this.bookings.findById(bookingId);
    if (!booking || booking.paymentStatus !== 'refund_escalated') throw new BookingNotFoundError();
    if (!payuRequestId.trim()) throw new BookingActionError('PayU refund request ID is required.');
    const result = await this.payments.checkRefund(payuRequestId.trim());
    if (result.status === 'failed')
      throw new BookingActionError(result.reason ?? 'PayU reports that the manual refund failed.');
    const pending = await this.bookings.markManualRefundPending(booking.id, payuRequestId.trim());
    if (!pending) throw new BookingActionError('Refund can no longer be verified.');
    if (result.status === 'success') {
      const completed = await this.bookings.markRefundCompleted(booking.id);
      if (!completed) throw new BookingActionError('Refund status could not be updated.');
      await this.bookings.appendTimeline(booking.id, {
        type: 'refund_verified',
        description: 'Admin verified the manual PayU refund successfully.',
        actor: 'admin',
      });
      return (await this.bookings.findById(booking.id)) ?? completed;
    }
    return pending;
  }

  private async initiateRefund(booking: BookingDTO, amountPaise: number): Promise<BookingDTO> {
    if (!booking.paymentId || !booking.refund?.requestToken)
      throw new BookingActionError('Refund details are incomplete.');
    const attempted = await this.bookings.recordRefundAttempt(booking.id);
    if (!attempted) throw new BookingActionError('Refund retry limit reached.');
    await this.bookings.appendTimeline(booking.id, {
      type: 'refund_initiated',
      description: `Refund attempt ${attempted.refund?.attemptCount ?? 1} initiated for INR ${(amountPaise / 100).toFixed(2)}.`,
      actor: 'system',
      attempt: attempted.refund?.attemptCount ?? 1,
    });
    const result = await this.payments.refund(
      booking.paymentId,
      amountPaise,
      attempted.refund?.requestToken ?? booking.refund.requestToken,
    );
    return (await this.bookings.markRefundRequested(booking.id, result.requestId)) ?? booking;
  }
}
