import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import type { BookingDTO, BookingTimelineEventDTO } from '@turfhood/shared';
import type {
  CreateBookingPersistenceInput,
  IBookingRepository,
} from '@domain/booking/repositories/IBookingRepository';
import { SlotUnavailableError } from '@domain/booking/errors/BookingErrors';
import { BookingModel, type BookingDocument } from '../models/BookingModel.js';
import { SlotReservationModel } from '../models/SlotReservationModel.js';

@injectable()
export class BookingRepository implements IBookingRepository {
  async statusCountsBetween(turfId: string, startDate: string, endDate: string) {
    if (!mongoose.isValidObjectId(turfId)) return { booked: 0, cancelled: 0, completed: 0 };
    const rows = await BookingModel.aggregate<{ _id: string; count: number }>([
      { $match: { turfId: new mongoose.Types.ObjectId(turfId), bookingDate: { $gte: startDate, $lte: endDate }, status: { $in: ['confirmed', 'completed', 'cancelled_by_user', 'cancelled_by_owner'] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts = new Map(rows.map((row) => [row._id, row.count]));
    return { booked: counts.get('confirmed') ?? 0, completed: counts.get('completed') ?? 0, cancelled: (counts.get('cancelled_by_user') ?? 0) + (counts.get('cancelled_by_owner') ?? 0) };
  }
  async revenueBetween(turfId: string, startDate: string, endDate: string) {
    if (!mongoose.isValidObjectId(turfId)) return { items: [], summary: { bookings: 0, grossRevenuePaise: 0, commissionPaise: 0, netEarningsPaise: 0 } };
    const documents = await BookingModel.find({ turfId, bookingDate: { $gte: startDate, $lte: endDate }, status: { $in: ['confirmed', 'completed'] } }).sort({ bookingDate: -1, createdAt: -1 });
    const items = documents.map((document) => this.toDTO(document));
    return { items, summary: {
      bookings: items.length,
      grossRevenuePaise: items.reduce((sum, item) => sum + item.subtotalPaise - item.discountPaise, 0),
      commissionPaise: items.reduce((sum, item) => sum + item.commissionPaise, 0),
      netEarningsPaise: items.reduce((sum, item) => sum + item.ownerEarningsPaise, 0),
    }};
  }
  async reserve(input: CreateBookingPersistenceInput): Promise<BookingDTO> {
    const session = await mongoose.startSession();
    let created: BookingDocument | undefined;
    try {
      await session.withTransaction(async () => {
        await this.expirePendingInSession(new Date(), session);
        const [booking] = await BookingModel.create([input], { session });
        if (!booking) throw new Error('Booking was not created.');
        created = booking;
        await SlotReservationModel.insertMany(
          input.slots.map((slot) => ({
            bookingId: booking._id,
            courtId: input.courtId,
            bookingDate: input.bookingDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            state: 'held',
            expiresAt: input.reservationExpiresAt,
          })),
          { session },
        );
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        (error as { code: unknown }).code === 11000
      )
        throw new SlotUnavailableError();
      throw error;
    } finally {
      await session.endSession();
    }
    return this.toDTO(created!);
  }
  async findById(id: string) {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await BookingModel.findById(id);
    return doc ? this.toDTO(doc) : null;
  }
  async findByTransactionId(txn: string) {
    const doc = await BookingModel.findOne({ payuTransactionId: txn });
    return doc ? this.toDTO(doc) : null;
  }
  async listByUser(userId: string, page: number, limit: number) {
    const filter = { userId, status: { $nin: ['pending_payment', 'expired'] } };
    const [docs, total] = await Promise.all([
      BookingModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      BookingModel.countDocuments(filter),
    ]);
    return { items: docs.map((doc) => this.toDTO(doc)), total };
  }
  async listByTurf(turfId: string, page: number, limit: number) {
    const filter = { turfId, status: { $nin: ['pending_payment', 'expired'] } };
    const [docs, total] = await Promise.all([
      BookingModel.find(filter)
        .sort({ bookingDate: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      BookingModel.countDocuments(filter),
    ]);
    return { items: docs.map((doc) => this.toDTO(doc)), total };
  }
  async occupiedStarts(courtId: string, dates: string[], now: Date) {
    await this.expirePending(now);
    const docs = await SlotReservationModel.find({
      courtId,
      bookingDate: { $in: dates },
      $or: [{ state: 'confirmed' }, { state: 'held', expiresAt: { $gt: now } }],
    });
    const map = new Map<string, Map<string, 'held' | 'confirmed'>>();
    for (const doc of docs) {
      const slots = map.get(doc.bookingDate) ?? new Map<string, 'held' | 'confirmed'>();
      slots.set(doc.startTime, doc.state);
      map.set(doc.bookingDate, slots);
    }
    return map;
  }
  async expirePending(now: Date) {
    const session = await mongoose.startSession();
    let count = 0;
    try {
      await session.withTransaction(async () => {
        count = await this.expirePendingInSession(now, session);
      });
    } finally {
      await session.endSession();
    }
    return count;
  }
  async completePast(now: Date) {
    const candidates = await BookingModel.find({ status: 'confirmed' }).select('bookingDate slots');
    const completedIds = candidates
      .filter((booking) => {
        const lastEnd = booking.slots.reduce(
          (latest, slot) => (slot.endTime > latest ? slot.endTime : latest),
          '',
        );
        return lastEnd && new Date(`${booking.bookingDate}T${lastEnd}:00+05:30`) <= now;
      })
      .map((booking) => booking._id);
    if (!completedIds.length) return 0;
    const session = await mongoose.startSession();
    let count = 0;
    try {
      await session.withTransaction(async () => {
        const result = await BookingModel.updateMany(
          { _id: { $in: completedIds }, status: 'confirmed' },
          {
            $set: { status: 'completed' },
            $push: {
              timeline: {
                type: 'booking_completed',
                description: 'Court play completed.',
                occurredAt: now,
                actor: 'system',
              },
            },
          },
          { session },
        );
        count = result.modifiedCount;
        await SlotReservationModel.deleteMany({ bookingId: { $in: completedIds } }, { session });
      });
    } finally {
      await session.endSession();
    }
    return count;
  }
  async confirm(id: string, paymentId: string) {
    const session = await mongoose.startSession();
    let doc: BookingDocument | null = null;
    try {
      await session.withTransaction(async () => {
        doc = await BookingModel.findOneAndUpdate(
          { _id: id, status: 'pending_payment' },
          {
            $set: {
              status: 'confirmed',
              paymentStatus: 'paid',
              paymentId,
              confirmedAt: new Date(),
            },
            $unset: { reservationExpiresAt: 1 },
          },
          { new: true, session },
        );
        if (doc)
          await SlotReservationModel.updateMany(
            { bookingId: id },
            { $set: { state: 'confirmed' }, $unset: { expiresAt: 1 } },
            { session },
          );
      });
    } finally {
      await session.endSession();
    }
    if (doc) return { booking: this.toDTO(doc), newlyConfirmed: true };
    const existing = await this.findById(id);
    return existing ? { booking: existing, newlyConfirmed: false } : null;
  }
  async fail(id: string) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await BookingModel.updateOne(
          { _id: id, status: 'pending_payment' },
          {
            $set: { status: 'payment_failed', paymentStatus: 'failed' },
            $push: {
              timeline: {
                type: 'payment_failed',
                description: 'Payment failed.',
                occurredAt: new Date(),
                actor: 'system',
              },
            },
          },
          { session },
        );
        await SlotReservationModel.deleteMany({ bookingId: id, state: 'held' }, { session });
      });
    } finally {
      await session.endSession();
    }
  }
  async markLatePaymentForRefund(id: string, paymentId: string) {
    const session = await mongoose.startSession();
    let doc: BookingDocument | null = null;
    try {
      await session.withTransaction(async () => {
        doc = await BookingModel.findOneAndUpdate(
          { _id: id, status: { $in: ['pending_payment', 'payment_failed', 'expired'] } },
          {
            $set: {
              status: 'expired',
              paymentStatus: 'refund_pending',
              paymentId,
              refund: { requestToken: `late-${id.slice(-18)}` },
            },
            $unset: { reservationExpiresAt: 1 },
          },
          { new: true, session },
        );
        await SlotReservationModel.deleteMany({ bookingId: id, state: 'held' }, { session });
      });
    } finally {
      await session.endSession();
    }
    return doc ? this.toDTO(doc) : null;
  }
  async cancel(
    id: string,
    actor: 'customer' | 'owner',
    reason: string | undefined,
    refundPaise: number,
    refundRequestToken?: string,
  ) {
    const session = await mongoose.startSession();
    let doc: BookingDocument | null = null;
    try {
      await session.withTransaction(async () => {
        doc = await BookingModel.findOneAndUpdate(
          { _id: id, status: 'confirmed' },
          {
            $set: {
              status: actor === 'customer' ? 'cancelled_by_user' : 'cancelled_by_owner',
              paymentStatus: refundPaise > 0 ? 'refund_pending' : 'paid',
              cancellation: {
                actor,
                ...(reason ? { reason } : {}),
                cancelledAt: new Date(),
                refundPaise,
              },
              ...(refundRequestToken ? { refund: { requestToken: refundRequestToken } } : {}),
            },
          },
          { new: true, session },
        );
        if (doc) await SlotReservationModel.deleteMany({ bookingId: id }, { session });
      });
    } finally {
      await session.endSession();
    }
    return doc ? this.toDTO(doc) : null;
  }
  async markRefundRequested(id: string, payuRequestId: string) {
    const doc = await BookingModel.findOneAndUpdate(
      { _id: id, paymentStatus: 'refund_pending' },
      {
        $set: {
          'refund.payuRequestId': payuRequestId,
          'refund.requestedAt': new Date(),
        },
        $unset: { 'refund.failureReason': 1 },
      },
      { new: true },
    );
    return doc ? this.toDTO(doc) : null;
  }
  async listPendingRefunds(limit: number) {
    const docs = await BookingModel.find({
      paymentStatus: 'refund_pending',
    })
      .sort({ 'refund.lastCheckedAt': 1, updatedAt: 1 })
      .limit(limit);
    return docs.map((doc) => this.toDTO(doc));
  }
  async prepareRefund(id: string, requestToken: string) {
    const doc = await BookingModel.findOneAndUpdate(
      { _id: id, paymentStatus: 'refund_pending', 'refund.requestToken': { $exists: false } },
      { $set: { refund: { requestToken } } },
      { new: true },
    );
    if (doc) return this.toDTO(doc);
    return this.findById(id);
  }
  async markRefundChecked(id: string, failureReason?: string) {
    await BookingModel.updateOne(
      { _id: id, paymentStatus: 'refund_pending' },
      {
        $set: {
          'refund.lastCheckedAt': new Date(),
          ...(failureReason ? { 'refund.failureReason': failureReason } : {}),
        },
        ...(!failureReason ? { $unset: { 'refund.failureReason': 1 } } : {}),
      },
    );
  }
  async markRefundFailed(id: string, reason: string) {
    const doc = await BookingModel.findOneAndUpdate(
      { _id: id, paymentStatus: 'refund_pending' },
      {
        $set: {
          paymentStatus: 'refund_failed',
          'refund.lastCheckedAt': new Date(),
          'refund.failureReason': reason,
        },
      },
      { new: true },
    );
    return doc ? this.toDTO(doc) : null;
  }
  async markRefundCompleted(id: string) {
    const existing = await BookingModel.findOne({
      _id: id,
      paymentStatus: { $in: ['refund_pending', 'refund_escalated'] },
    });
    if (!existing) return null;
    const refundPaise = existing.cancellation?.refundPaise ?? existing.finalAmountPaise;
    const partial = refundPaise < existing.finalAmountPaise;
    const doc = await BookingModel.findOneAndUpdate(
      { _id: id, paymentStatus: { $in: ['refund_pending', 'refund_escalated'] } },
      {
        $set: {
          status: partial ? 'partially_refunded' : 'refunded',
          paymentStatus: partial ? 'partially_refunded' : 'refunded',
          'refund.lastCheckedAt': new Date(),
          'refund.completedAt': new Date(),
        },
        $unset: { 'refund.failureReason': 1 },
        $push: {
          timeline: {
            type: 'refund_completed',
            description: partial ? 'Partial refund completed.' : 'Full refund completed.',
            occurredAt: new Date(),
            actor: 'system',
          },
        },
      },
      { new: true },
    );
    return doc ? this.toDTO(doc) : null;
  }
  async abandonPending(id: string, userId: string) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await BookingModel.updateOne(
          { _id: id, userId, status: 'pending_payment' },
          {
            $set: { status: 'expired', paymentStatus: 'failed' },
            $unset: { reservationExpiresAt: 1 },
            $push: {
              timeline: {
                type: 'payment_failed',
                description: 'Checkout was abandoned before PayU opened.',
                occurredAt: new Date(),
                actor: 'system',
              },
            },
          },
          { session },
        );
        if (result.modifiedCount)
          await SlotReservationModel.deleteMany({ bookingId: id, state: 'held' }, { session });
      });
    } finally {
      await session.endSession();
    }
  }
  async recordRefundAttempt(id: string) {
    const doc = await BookingModel.findOneAndUpdate(
      {
        _id: id,
        paymentStatus: 'refund_pending',
        $or: [{ 'refund.attemptCount': { $exists: false } }, { 'refund.attemptCount': { $lt: 3 } }],
      },
      { $inc: { 'refund.attemptCount': 1 }, $set: { 'refund.lastCheckedAt': new Date() } },
      { new: true },
    );
    return doc ? this.toDTO(doc) : null;
  }
  async recordRefundFailure(id: string, reason: string, maxAttempts: number) {
    const existing = await BookingModel.findOne({ _id: id, paymentStatus: 'refund_pending' });
    if (!existing) return null;
    const attempts = existing.refund?.attemptCount ?? 0;
    const escalated = attempts >= maxAttempts;
    const doc = await BookingModel.findOneAndUpdate(
      { _id: id, paymentStatus: 'refund_pending' },
      {
        $set: {
          paymentStatus: escalated ? 'refund_escalated' : 'refund_pending',
          'refund.lastCheckedAt': new Date(),
          'refund.failureReason': reason,
          ...(!escalated ? { 'refund.requestToken': `refund-${id.slice(-12)}-${attempts + 1}` } : {}),
        },
        $unset: { 'refund.payuRequestId': 1, 'refund.requestedAt': 1 },
        $push: {
          timeline: {
            type: escalated ? 'refund_escalated' : 'refund_failed',
            description: escalated
              ? `Refund failed after ${attempts} attempts and requires admin action: ${reason}`
              : `Refund attempt ${attempts} failed: ${reason}`,
            occurredAt: new Date(),
            actor: 'system',
            attempt: attempts,
          },
        },
      },
      { new: true },
    );
    return doc ? this.toDTO(doc) : null;
  }
  async listEscalatedRefunds(page: number, limit: number) {
    const filter = { paymentStatus: 'refund_escalated' } as const;
    const [docs, total] = await Promise.all([
      BookingModel.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
      BookingModel.countDocuments(filter),
    ]);
    return { items: docs.map((doc) => this.toDTO(doc)), total };
  }
  async markManualRefundPending(id: string, requestId: string) {
    const doc = await BookingModel.findOneAndUpdate(
      { _id: id, paymentStatus: 'refund_escalated' },
      {
        $set: {
          paymentStatus: 'refund_pending',
          'refund.payuRequestId': requestId,
          'refund.requestedAt': new Date(),
          'refund.lastCheckedAt': new Date(),
        },
        $unset: { 'refund.failureReason': 1 },
        $push: {
          timeline: {
            type: 'refund_verified',
            description: 'Admin submitted a PayU dashboard refund for verification.',
            occurredAt: new Date(),
            actor: 'admin',
          },
        },
      },
      { new: true },
    );
    return doc ? this.toDTO(doc) : null;
  }
  async appendTimeline(id: string, event: Omit<BookingTimelineEventDTO, 'occurredAt'>) {
    await BookingModel.updateOne(
      { _id: id },
      { $push: { timeline: { ...event, occurredAt: new Date() } } },
    );
  }
  private async expirePendingInSession(now: Date, session: mongoose.ClientSession) {
    const result = await BookingModel.updateMany(
      { status: 'pending_payment', reservationExpiresAt: { $lte: now } },
      {
        $set: { status: 'expired', paymentStatus: 'failed' },
        $push: {
          timeline: {
            type: 'payment_failed',
            description: 'Checkout hold expired before payment completed.',
            occurredAt: now,
            actor: 'system',
          },
        },
      },
      { session },
    );
    await SlotReservationModel.deleteMany({ state: 'held', expiresAt: { $lte: now } }, { session });
    return result.modifiedCount;
  }
  private toDTO(doc: BookingDocument): BookingDTO {
    return {
      id: doc._id.toString(),
      reference: doc.reference,
      userId: doc.userId.toString(),
      turfId: doc.turfId.toString(),
      courtId: doc.courtId.toString(),
      bookingDate: doc.bookingDate,
      slots: doc.slots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        pricePaise: slot.pricePaise,
      })),
      turfName: doc.turfName,
      courtName: doc.courtName,
      address: doc.address,
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      ...(doc.customerPhone ? { customerPhone: doc.customerPhone } : {}),
      subtotalPaise: doc.subtotalPaise,
      discountPaise: doc.discountPaise,
      taxPaise: doc.taxPaise,
      platformFeePaise: doc.platformFeePaise,
      commissionPercentage: doc.commissionBasisPoints / 100,
      commissionPaise: doc.commissionPaise,
      ownerEarningsPaise: doc.ownerEarningsPaise,
      finalAmountPaise: doc.finalAmountPaise,
      currency: 'INR',
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      timeline: (doc.timeline ?? []).map((event) => ({
        type: event.type,
        description: event.description,
        occurredAt: event.occurredAt.toISOString(),
        ...(event.actor ? { actor: event.actor } : {}),
        ...(event.attempt ? { attempt: event.attempt } : {}),
      })),
      ...(doc.reservationExpiresAt
        ? { reservationExpiresAt: doc.reservationExpiresAt.toISOString() }
        : {}),
      ...(doc.paymentId ? { paymentId: doc.paymentId } : {}),
      ...(doc.refund?.requestToken
        ? {
            refund: {
              requestToken: doc.refund.requestToken,
              ...(doc.refund.payuRequestId ? { payuRequestId: doc.refund.payuRequestId } : {}),
              ...(doc.refund.requestedAt
                ? { requestedAt: doc.refund.requestedAt.toISOString() }
                : {}),
              ...(doc.refund.lastCheckedAt
                ? { lastCheckedAt: doc.refund.lastCheckedAt.toISOString() }
                : {}),
              ...(doc.refund.completedAt
                ? { completedAt: doc.refund.completedAt.toISOString() }
                : {}),
              ...(doc.refund.failureReason ? { failureReason: doc.refund.failureReason } : {}),
              attemptCount: doc.refund.attemptCount ?? 0,
            },
          }
        : {}),
      ...(doc.cancellation?.cancelledAt
        ? {
            cancellation: {
              actor: doc.cancellation.actor,
              ...(doc.cancellation.reason ? { reason: doc.cancellation.reason } : {}),
              cancelledAt: doc.cancellation.cancelledAt.toISOString(),
              refundPaise: doc.cancellation.refundPaise,
            },
          }
        : {}),
      cancellationPolicy: doc.cancellationPolicy,
      createdAt: doc.createdAt.toISOString(),
      ...(doc.confirmedAt ? { confirmedAt: doc.confirmedAt.toISOString() } : {}),
    };
  }
}
