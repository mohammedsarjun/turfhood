import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import type { OpenSessionDTO } from '@turfhood/shared';
import type {
  CreateOpenSessionPersistenceInput,
  IOpenSessionRepository,
} from '@domain/openSession/repositories/IOpenSessionRepository';
import { SlotUnavailableError } from '@domain/booking/errors/BookingErrors';
import { OPEN_SESSION_PAYMENT_WINDOW_MS } from '@domain/openSession/constants';
import { openSessionPaymentCutoff } from '@domain/openSession/services/OpenSessionPaymentPolicy';
import { SlotReservationModel } from '@infrastructure/booking/models/SlotReservationModel';

import { OpenSessionModel, type OpenSessionDocument } from '../models/OpenSessionModel.js';

@injectable()
export class OpenSessionRepository implements IOpenSessionRepository {
  async listByTurf(turfId: string, page: number, limit: number, statuses?: string[]) {
    if (!mongoose.isValidObjectId(turfId)) return { items: [], total: 0 };
    const filter = {
      turfId: new mongoose.Types.ObjectId(turfId),
      ...(statuses ? { status: { $in: statuses } } : {}),
    };
    const [documents, total] = await Promise.all([
      OpenSessionModel.find(filter)
        .sort({ bookingDate: -1, startTime: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      OpenSessionModel.countDocuments(filter),
    ]);
    return { items: documents.map((document) => this.toDTO(document)), total };
  }
  async create(input: CreateOpenSessionPersistenceInput) {
    const session = await mongoose.startSession();
    let created: OpenSessionDocument | undefined;
    try {
      await session.withTransaction(async () => {
        await SlotReservationModel.deleteMany(
          { state: 'held', expiresAt: { $lte: new Date() } },
          { session },
        );
        const [doc] = await OpenSessionModel.create(
          [
            {
              ...input,
              status: 'awaiting_creator_payment',
              location: {
                type: 'Point',
                coordinates: [input.location.longitude, input.location.latitude],
              },
              participants: [
                {
                  userId: input.creatorId,
                  name: input.creator.name,
                  isCreator: true,
                  transactionId: input.creator.transactionId,
                  paymentStatus: 'pending',
                  joinedAt: new Date(),
                },
              ],
            },
          ],
          { session },
        );
        if (!doc) throw new Error('Open session was not created.');
        created = doc;
        await SlotReservationModel.create(
          [
            {
              bookingId: doc._id,
              courtId: input.courtId,
              bookingDate: input.bookingDate,
              startTime: input.startTime,
              endTime: input.endTime,
              state: 'held',
              expiresAt: new Date(Date.now() + OPEN_SESSION_PAYMENT_WINDOW_MS),
            },
          ],
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
    const doc = await OpenSessionModel.findById(id);
    return doc ? this.toDTO(doc) : null;
  }

  async list(input: {
    page: number;
    limit: number;
    sportTypeId?: string;
    coordinates?: { latitude: number; longitude: number };
  }) {
    const filter = {
      status: 'open',
      fillDeadline: { $gt: new Date() },
      ...(input.sportTypeId && mongoose.isValidObjectId(input.sportTypeId)
        ? { sportTypeId: new mongoose.Types.ObjectId(input.sportTypeId) }
        : {}),
    };
    if (input.coordinates) {
      const docs = await OpenSessionModel.aggregate<OpenSessionDocument>([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [input.coordinates.longitude, input.coordinates.latitude],
            },
            distanceField: 'distance',
            spherical: true,
            query: filter,
          },
        },
        { $skip: (input.page - 1) * input.limit },
        { $limit: input.limit },
      ]);
      const total = await OpenSessionModel.countDocuments(filter);
      return { items: docs.map((doc) => this.toDTO(doc)), total };
    }
    const [docs, total] = await Promise.all([
      OpenSessionModel.find(filter)
        .sort({ bookingDate: 1, startTime: 1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit),
      OpenSessionModel.countDocuments(filter),
    ]);
    return { items: docs.map((doc) => this.toDTO(doc)), total };
  }

  async listByParticipant(userId: string, page: number, limit: number, statuses?: string[]) {
    if (!mongoose.isValidObjectId(userId)) return { items: [], total: 0 };
    const filter = {
      ...(statuses ? { status: { $in: statuses } } : {}),
      participants: {
        $elemMatch: {
          userId: new mongoose.Types.ObjectId(userId),
          paymentStatus: {
            $in: ['paid', 'refund_pending', 'refunded', 'refund_failed'],
          },
        },
      },
    };
    const [docs, total] = await Promise.all([
      OpenSessionModel.find(filter)
        .sort({ bookingDate: -1, startTime: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      OpenSessionModel.countDocuments(filter),
    ]);
    return { items: docs.map((doc) => this.toDTO(doc)), total };
  }

  async addPendingParticipant(
    id: string,
    user: { id: string; name: string },
    transactionId: string,
  ) {
    const now = new Date();
    await OpenSessionModel.updateOne(
      { _id: id },
      {
        $pull: {
          participants: {
            isCreator: false,
            paymentStatus: 'pending',
            joinedAt: { $lte: openSessionPaymentCutoff(now) },
          },
        },
      },
    );

    // Reuse an existing pending place so an abandoned PayU tab can be retried immediately.
    const retried = await OpenSessionModel.findOneAndUpdate(
      {
        _id: id,
        status: 'open',
        fillDeadline: { $gt: now },
        participants: {
          $elemMatch: {
            userId: user.id,
            isCreator: false,
            paymentStatus: 'pending',
          },
        },
      },
      {
        $set: {
          'participants.$.name': user.name,
          'participants.$.transactionId': transactionId,
          'participants.$.joinedAt': now,
        },
      },
      { new: true },
    );
    if (retried) return this.toDTO(retried);

    const doc = await OpenSessionModel.findOneAndUpdate(
      {
        _id: id,
        status: 'open',
        fillDeadline: { $gt: new Date() },
        participants: {
          $not: {
            $elemMatch: {
              userId: user.id,
              paymentStatus: { $in: ['pending', 'paid'] },
            },
          },
        },
        $expr: {
          $lt: [
            {
              $size: {
                $filter: {
                  input: '$participants',
                  as: 'participant',
                  cond: { $in: ['$$participant.paymentStatus', ['pending', 'paid']] },
                },
              },
            },
            '$maximumPlayers',
          ],
        },
      },
      {
        $push: {
          participants: {
            userId: user.id,
            name: user.name,
            isCreator: false,
            transactionId,
            paymentStatus: 'pending',
            joinedAt: now,
          },
        },
      },
      { new: true },
    );
    return doc ? this.toDTO(doc) : null;
  }

  async findByTransactionId(transactionId: string) {
    const doc = await OpenSessionModel.findOne({ 'participants.transactionId': transactionId });
    return doc ? this.toDTO(doc) : null;
  }
  async findPayment(transactionId: string) {
    const doc = await OpenSessionModel.findOne(
      { 'participants.transactionId': transactionId },
      { participants: { $elemMatch: { transactionId } } },
    );
    const participant = doc?.participants[0];
    return participant
      ? { createdAt: participant.joinedAt, status: participant.paymentStatus }
      : null;
  }

  async confirmParticipant(transactionId: string, paymentId: string) {
    const session = await mongoose.startSession();
    let result: OpenSessionDocument | null = null;
    try {
      await session.withTransaction(async () => {
        const doc = await OpenSessionModel.findOneAndUpdate(
          { 'participants.transactionId': transactionId, 'participants.paymentStatus': 'pending' },
          {
            $set: { 'participants.$.paymentStatus': 'paid', 'participants.$.paymentId': paymentId },
          },
          { new: true, session },
        );
        if (!doc) return;
        const paid = doc.participants.filter(
          (participant) => participant.paymentStatus === 'paid',
        ).length;
        if (doc.status === 'awaiting_creator_payment') {
          doc.status = 'open';
          await SlotReservationModel.updateMany(
            { bookingId: doc._id, state: 'held' },
            { $set: { expiresAt: doc.fillDeadline } },
            { session },
          );
        }
        if (paid >= doc.maximumPlayers) {
          doc.status = 'full';
        }
        result = await doc.save({ session });
      });
    } finally {
      await session.endSession();
    }
    return result ? this.toDTO(result) : this.findByTransactionId(transactionId);
  }

  async listFullDue(now: Date) {
    const docs = await OpenSessionModel.find({ status: 'full', fillDeadline: { $lte: now } });
    return docs.map((doc) => this.toDTO(doc));
  }

  async markConfirmed(sessionId: string) {
    await OpenSessionModel.updateOne(
      { _id: sessionId, status: 'full' },
      { $set: { status: 'confirmed' } },
    );
  }

  async beginParticipantCancellation(sessionId: string, userId: string, now: Date) {
    const doc = await OpenSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        status: { $in: ['open', 'full'] },
        fillDeadline: { $gt: now },
        participants: {
          $elemMatch: {
            userId,
            paymentStatus: 'paid',
            paymentId: { $exists: true },
          },
        },
      },
      {
        $set: {
          status: 'open',
          'participants.$.paymentStatus': 'refund_pending',
          'participants.$.refundReason': 'Participant cancelled before the 48-hour deadline.',
          'participants.$.refundAttemptCount': 0,
        },
      },
      { new: true },
    );
    const participant = doc?.participants.find(
      (item) => item.userId.toString() === userId && item.paymentStatus === 'refund_pending',
    );
    return participant?.paymentId
      ? { paymentId: participant.paymentId, amountPaise: doc!.pricePerParticipantPaise }
      : null;
  }

  async failParticipant(transactionId: string) {
    const removed = await OpenSessionModel.updateOne(
      {
        participants: {
          $elemMatch: {
            transactionId,
            paymentStatus: 'pending',
            isCreator: false,
          },
        },
      },
      { $pull: { participants: { transactionId, paymentStatus: 'pending', isCreator: false } } },
    );
    if (removed.modifiedCount > 0) return;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const doc = await OpenSessionModel.findOneAndUpdate(
          {
            status: 'awaiting_creator_payment',
            participants: {
              $elemMatch: { transactionId, paymentStatus: 'pending', isCreator: true },
            },
          },
          {
            $set: {
              status: 'cancelled',
              'participants.$.paymentStatus': 'refund_failed',
            },
          },
          { new: true, session },
        );
        if (doc) {
          await SlotReservationModel.deleteMany({ bookingId: doc._id, state: 'held' }, { session });
        }
      });
    } finally {
      await session.endSession();
    }
  }

  async expirePendingParticipants(now: Date) {
    const paymentCutoff = openSessionPaymentCutoff(now);
    const result = await OpenSessionModel.updateMany(
      {
        status: 'open',
        participants: {
          $elemMatch: {
            isCreator: false,
            paymentStatus: 'pending',
            joinedAt: { $lte: paymentCutoff },
          },
        },
      },
      {
        $pull: {
          participants: {
            isCreator: false,
            paymentStatus: 'pending',
            joinedAt: { $lte: paymentCutoff },
          },
        },
      },
    );
    return result.modifiedCount;
  }

  async expireUnfilled(now: Date) {
    const docs = await OpenSessionModel.find({
      $or: [
        {
          status: 'awaiting_creator_payment',
          createdAt: { $lte: openSessionPaymentCutoff(now) },
        },
        { status: 'open', fillDeadline: { $lte: now } },
      ],
    });
    const results: Array<{
      sessionId: string;
      payments: Array<{ userId: string; paymentId: string; amountPaise: number }>;
    }> = [];
    for (const doc of docs) {
      doc.status = 'cancelled';
      const paid = doc.participants.filter(
        (participant) => participant.paymentStatus === 'paid' && participant.paymentId,
      );
      for (const participant of paid) participant.paymentStatus = 'refund_pending';
      for (const participant of paid) {
        participant.refundReason = 'The open session did not fill before the 48-hour deadline.';
        participant.refundAttemptCount = 0;
      }
      await doc.save();
      await SlotReservationModel.deleteMany({ bookingId: doc._id, state: 'held' });
      results.push({
        sessionId: doc._id.toString(),
        payments: paid.map((participant) => ({
          userId: participant.userId.toString(),
          paymentId: participant.paymentId!,
          amountPaise: doc.pricePerParticipantPaise,
        })),
      });
    }
    return results;
  }

  async markParticipantRefundRequested(sessionId: string, userId: string, requestId: string) {
    await OpenSessionModel.updateOne(
      {
        _id: sessionId,
        participants: { $elemMatch: { userId, paymentStatus: 'refund_pending' } },
      },
      {
        $set: {
          'participants.$.paymentStatus': 'refund_pending',
          'participants.$.refundRequestId': requestId,
          'participants.$.refundRequestedAt': new Date(),
        },
      },
    );
  }

  async listPendingParticipantRefunds() {
    const docs = await OpenSessionModel.find({
      participants: {
        $elemMatch: { paymentStatus: 'refund_pending', paymentId: { $exists: true } },
      },
    });
    return docs.flatMap((doc) =>
      doc.participants.flatMap((participant) =>
        participant.paymentStatus === 'refund_pending' && participant.paymentId
          ? [
              {
                sessionId: doc._id.toString(),
                userId: participant.userId.toString(),
                paymentId: participant.paymentId,
                amountPaise: doc.pricePerParticipantPaise,
                attemptCount: participant.refundAttemptCount ?? 0,
                ...(participant.refundRequestToken
                  ? { requestToken: participant.refundRequestToken }
                  : {}),
                ...(participant.refundRequestId ? { requestId: participant.refundRequestId } : {}),
              },
            ]
          : [],
      ),
    );
  }

  async recordParticipantRefundAttempt(
    sessionId: string,
    userId: string,
    requestToken: string,
    maxAttempts: number,
  ) {
    const result = await OpenSessionModel.updateOne(
      {
        _id: sessionId,
        participants: {
          $elemMatch: {
            userId,
            paymentStatus: 'refund_pending',
            $or: [
              { refundAttemptCount: { $exists: false } },
              { refundAttemptCount: { $lt: maxAttempts } },
            ],
          },
        },
      },
      {
        $inc: { 'participants.$.refundAttemptCount': 1 },
        $set: {
          'participants.$.refundRequestToken': requestToken,
          'participants.$.refundRequestedAt': new Date(),
        },
      },
    );
    return result.modifiedCount > 0;
  }

  async recordParticipantRefundFailure(
    sessionId: string,
    userId: string,
    reason: string,
    terminal: boolean,
    rotateToken: boolean,
  ) {
    await OpenSessionModel.updateOne(
      { _id: sessionId, participants: { $elemMatch: { userId, paymentStatus: 'refund_pending' } } },
      {
        $set: {
          'participants.$.paymentStatus': terminal ? 'refund_failed' : 'refund_pending',
          'participants.$.refundFailureReason': reason,
        },
        $unset: {
          'participants.$.refundRequestId': 1,
          ...(rotateToken ? { 'participants.$.refundRequestToken': 1 } : {}),
        },
      },
    );
  }

  async markParticipantRefundResult(
    sessionId: string,
    userId: string,
    status: 'refunded' | 'refund_failed',
    reason?: string,
  ) {
    await OpenSessionModel.updateOne(
      { _id: sessionId, participants: { $elemMatch: { userId, paymentStatus: 'refund_pending' } } },
      {
        $set: {
          'participants.$.paymentStatus': status,
          ...(status === 'refunded'
            ? { 'participants.$.refundedAt': new Date() }
            : { 'participants.$.refundFailureReason': reason ?? 'Refund processing failed.' }),
        },
      },
    );
  }

  async listRefundsByUser(userId: string) {
    const docs = await OpenSessionModel.find({
      participants: {
        $elemMatch: {
          userId,
          paymentStatus: { $in: ['refund_pending', 'refunded', 'refund_failed'] },
        },
      },
    }).sort({ updatedAt: -1 });
    return docs.flatMap((doc) =>
      doc.participants.flatMap((participant, index) => {
        if (
          participant.userId.toString() !== userId ||
          !['refund_pending', 'refunded', 'refund_failed'].includes(participant.paymentStatus)
        )
          return [];
        return [
          {
            id: `${doc._id.toString()}-${index}`,
            source: 'open_session' as const,
            reference: `OS-${doc._id.toString().slice(-8).toUpperCase()}`,
            turfName: doc.turfName,
            courtName: doc.courtName,
            amountPaise: doc.pricePerParticipantPaise,
            status:
              participant.paymentStatus === 'refunded'
                ? ('refunded' as const)
                : participant.paymentStatus === 'refund_failed'
                  ? ('failed' as const)
                  : ('pending' as const),
            reason: participant.refundReason ?? 'Open-session payment refund.',
            attemptCount: participant.refundAttemptCount ?? 0,
            escalated: participant.paymentStatus === 'refund_failed',
            ...(participant.paymentId ? { paymentReference: participant.paymentId } : {}),
            ...(participant.refundRequestId
              ? { refundReference: participant.refundRequestId }
              : {}),
            ...(participant.refundRequestedAt
              ? { requestedAt: participant.refundRequestedAt.toISOString() }
              : {}),
            ...(participant.refundedAt
              ? { completedAt: participant.refundedAt.toISOString() }
              : {}),
            ...(participant.refundFailureReason
              ? { failureReason: participant.refundFailureReason }
              : {}),
            createdAt: participant.joinedAt.toISOString(),
          },
        ];
      }),
    );
  }

  private toDTO(doc: OpenSessionDocument): OpenSessionDTO {
    const participants = doc.participants.filter(
      (participant) =>
        participant.paymentStatus !== 'refund_failed' || Boolean(participant.paymentId),
    );
    return {
      id: doc._id.toString(),
      creatorId: doc.creatorId.toString(),
      turfId: doc.turfId.toString(),
      courtId: doc.courtId.toString(),
      turfName: doc.turfName,
      courtName: doc.courtName,
      ...(doc.courtImage ? { courtImage: doc.courtImage } : {}),
      address: doc.address,
      location: { longitude: doc.location.coordinates[0], latitude: doc.location.coordinates[1] },
      sportTypeId: doc.sportTypeId.toString(),
      sportName: doc.sportName,
      bookingDate: doc.bookingDate,
      startTime: doc.startTime,
      endTime: doc.endTime,
      minimumPlayers: doc.minimumPlayers,
      maximumPlayers: doc.maximumPlayers,
      joinedPlayers: participants.filter((participant) => participant.paymentStatus === 'paid')
        .length,
      totalPricePaise: doc.totalPricePaise,
      pricePerParticipantPaise: doc.pricePerParticipantPaise,
      status: doc.status,
      fillDeadline: doc.fillDeadline.toISOString(),
      participants: participants.map((participant) => ({
        userId: participant.userId.toString(),
        name: participant.name,
        isCreator: participant.isCreator,
        paymentStatus: participant.paymentStatus,
        joinedAt: participant.joinedAt.toISOString(),
      })),
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
