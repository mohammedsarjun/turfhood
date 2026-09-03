import { randomUUID } from 'node:crypto';
import { inject, injectable } from 'tsyringe';
import type { CreateOpenSessionRequest, OpenSessionListResponse } from '@turfhood/shared';
import type { IManageOpenSessionsUseCase } from './IManageOpenSessionsUseCase.js';
import type { IOpenSessionRepository } from '@domain/openSession/repositories/IOpenSessionRepository';
import { OPEN_SESSION_TOKENS } from '@domain/openSession/tokens';
import type { IPaymentService, PaymentCallback } from '@domain/booking/services/IPaymentService';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import type { ICourtRepository } from '@domain/court/repositories/ICourtRepository';
import { COURT_TOKENS } from '@domain/court/tokens';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import type { ISportsTypeRepository } from '@domain/sportsType/repositories/ISportsTypeRepository';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import { BookingActionError, BookingNotFoundError } from '@domain/booking/errors/BookingErrors';
import { generateSlots } from '@application/court/use-cases/GetPublicCourtDetailsUseCase';

const playTime = (date: string, time: string) => new Date(`${date}T${time}:00+05:30`);

@injectable()
export class ManageOpenSessionsUseCase implements IManageOpenSessionsUseCase {
  constructor(
    @inject(OPEN_SESSION_TOKENS.Repository) private readonly sessions: IOpenSessionRepository,
    @inject(BOOKING_TOKENS.Payment) private readonly payments: IPaymentService,
    @inject(BOOKING_TOKENS.Repository) private readonly bookings: IBookingRepository,
    @inject(COURT_TOKENS.CourtRepository) private readonly courts: ICourtRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(USER_TOKENS.UserRepository) private readonly users: IUserRepository,
    @inject(SPORTS_TYPE_TOKENS.SportsTypeRepository) private readonly sports: ISportsTypeRepository,
  ) {}

  async create(userId: string, input: CreateOpenSessionRequest) {
    const [court, turf, user, sport] = await Promise.all([
      this.courts.findByIdAndTurf(input.courtId, input.turfId),
      this.turfs.findApprovedById(input.turfId),
      this.users.findById(userId),
      this.sports.findById(input.sportTypeId),
    ]);
    if (!court || !turf || !user || !sport) throw new BookingNotFoundError();
    if (!court.allowOpenSessions) throw new BookingActionError('This court does not allow open sessions.');
    if (!court.sportTypeIds.includes(input.sportTypeId)) throw new BookingActionError('Select a sport supported by this court.');
    if (!Number.isInteger(input.maximumPlayers) || input.maximumPlayers < court.minPlayersForOpenSession || input.maximumPlayers > court.capacity)
      throw new BookingActionError(`Players must be between ${court.minPlayersForOpenSession} and ${court.capacity}.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.bookingDate))
      throw new BookingActionError('Select a valid booking date.');
    const startsAt = playTime(input.bookingDate, input.startTime);
    if (startsAt.getTime() < Date.now() + 48 * 60 * 60_000)
      throw new BookingActionError('Open sessions require a slot at least 48 hours from now.');
    const day = new Date(`${input.bookingDate}T00:00:00Z`).getUTCDay();
    const override = (await this.courts.listOverrides(input.courtId)).find((item) => item.date === input.bookingDate);
    const slot = generateSlots(court, input.bookingDate, day === 0 || day === 6 ? 'weekend' : 'weekday', override)
      .find((item) => item.startTime === input.startTime && item.endTime === input.endTime);
    if (!slot) throw new BookingActionError('The selected slot is unavailable.');
    const occupied = await this.bookings.occupiedStarts(input.courtId, [input.bookingDate], new Date());
    if (occupied.get(input.bookingDate)?.has(input.startTime)) throw new BookingActionError('The selected slot is no longer available.');
    const totalPricePaise = Math.round(slot.price * 100);
    const perHead = Math.ceil(totalPricePaise / input.maximumPlayers);
    const transactionId = `os-${randomUUID().replaceAll('-', '').slice(0, 27)}`;
    const created = await this.sessions.create({
      creatorId: userId, turfId: input.turfId, courtId: input.courtId, turfName: turf.name, courtName: court.name,
      ...(court.images.find((image) => image.isCover)?.url ?? court.images[0]?.url ? { courtImage: court.images.find((image) => image.isCover)?.url ?? court.images[0]!.url } : {}),
      address: [turf.address.line1, turf.address.city, turf.address.state, turf.address.pincode].join(', '),
      location: { longitude: turf.location.coordinates[0], latitude: turf.location.coordinates[1] },
      sportTypeId: input.sportTypeId, sportName: sport.name, bookingDate: input.bookingDate, startTime: input.startTime, endTime: input.endTime,
      minimumPlayers: court.minPlayersForOpenSession, maximumPlayers: input.maximumPlayers, totalPricePaise, pricePerParticipantPaise: perHead,
      fillDeadline: new Date(startsAt.getTime() - 48 * 60 * 60_000), creator: { name: user.name, transactionId },
    });
    return { session: created, payment: this.paymentForm(created, transactionId, user.name, user.email.toString()) };
  }

  async join(userId: string, sessionId: string) {
    const [user, existing] = await Promise.all([this.users.findById(userId), this.sessions.findById(sessionId)]);
    if (!user || !existing) throw new BookingNotFoundError();
    const transactionId = `os-${randomUUID().replaceAll('-', '').slice(0, 27)}`;
    const session = await this.sessions.addPendingParticipant(sessionId, { id: userId, name: user.name }, transactionId);
    if (!session) throw new BookingActionError('This session is full, closed, or you already joined it.');
    return { session, payment: this.paymentForm(session, transactionId, user.name, user.email.toString()) };
  }

  async list(input: { page: number; limit: number; sportTypeId?: string; latitude?: number; longitude?: number }): Promise<OpenSessionListResponse> {
    await this.expireUnfilled();
    const result = await this.sessions.list({ page: input.page, limit: input.limit, ...(input.sportTypeId ? { sportTypeId: input.sportTypeId } : {}), ...(input.latitude !== undefined && input.longitude !== undefined ? { coordinates: { latitude: input.latitude, longitude: input.longitude } } : {}) });
    return { items: result.items, pagination: { page: input.page, limit: input.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / input.limit)) } };
  }

  async details(sessionId: string) {
    await this.expireUnfilled();
    const session = await this.sessions.findById(sessionId);
    if (!session) throw new BookingNotFoundError();
    return session;
  }

  async paymentCallback(input: PaymentCallback) {
    const session = await this.sessions.findByTransactionId(input.txnid);
    if (!session) {
      const expiredSession = input.udf1 ? await this.sessions.findById(input.udf1) : null;
      if (
        expiredSession &&
        input.mihpayid &&
        input.status === 'success' &&
        this.payments.verifyCallback(input)
      ) {
        await this.payments.refund(
          input.mihpayid,
          Math.round(Number(input.amount) * 100),
          `os-late-${input.txnid.slice(-18)}`,
        );
      }
      throw new BookingNotFoundError();
    }
    const payment = await this.sessions.findPayment(input.txnid);
    const transactionExpired = payment
      ? payment.status === 'pending' && Date.now() - payment.createdAt.getTime() > 10 * 60_000
      : false;
    if (!this.payments.verifyCallback(input) || input.status !== 'success' || Math.round(Number(input.amount) * 100) !== session.pricePerParticipantPaise) {
      await this.sessions.failParticipant(input.txnid);
      throw new BookingActionError('Open-session payment verification failed.');
    }
    if (payment?.status === 'paid') return session;
    if (
      (transactionExpired || session.status === 'cancelled' || new Date(session.fillDeadline) <= new Date()) &&
      input.mihpayid
    ) {
      await this.payments.refund(input.mihpayid, session.pricePerParticipantPaise, `os-late-${input.txnid.slice(-18)}`);
      await this.sessions.failParticipant(input.txnid);
      throw new BookingActionError('The participant payment window expired and the payment is being refunded.');
    }
    const confirmed = await this.sessions.confirmParticipant(input.txnid, input.mihpayid ?? input.txnid);
    if (!confirmed) throw new BookingActionError('Participant could not be confirmed.');
    return confirmed;
  }

  async expireUnfilled() {
    const pendingRefunds = await this.sessions.listPendingParticipantRefunds();
    for (const refund of pendingRefunds) {
      try {
        const result = await this.payments.checkRefund(refund.requestId);
        if (result.status === 'success')
          await this.sessions.markParticipantRefundResult(refund.sessionId, refund.userId, 'refunded');
        else if (result.status === 'failed')
          await this.sessions.markParticipantRefundResult(refund.sessionId, refund.userId, 'refund_failed');
      } catch (error) {
        console.error('Unable to reconcile open-session refund.', error);
      }
    }
    const expired = await this.sessions.expireUnfilled(new Date());
    for (const session of expired) {
      for (const payment of session.payments) {
        try {
          const result = await this.payments.refund(payment.paymentId, payment.amountPaise, `os-refund-${session.sessionId.slice(-10)}-${payment.userId.slice(-8)}`);
          await this.sessions.markParticipantRefundRequested(session.sessionId, payment.userId, result.requestId);
        } catch (error) {
          console.error('Unable to initiate open-session refund.', error);
          await this.sessions.markParticipantRefundResult(session.sessionId, payment.userId, 'refund_failed');
        }
      }
    }
    return expired.length;
  }

  private paymentForm(session: { id: string; pricePerParticipantPaise: number; turfName: string; sportName: string }, transactionId: string, name: string, email: string) {
    return this.payments.createOpenSessionForm({ transactionId, sessionId: session.id, amountPaise: session.pricePerParticipantPaise, customerName: name, customerEmail: email, description: `${session.sportName} open session at ${session.turfName}` });
  }
}
