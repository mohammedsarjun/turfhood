import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import type { ReviewDTO } from '@turfhood/shared';
import type {
  CreateReviewPersistenceInput,
  IReviewRepository,
} from '@domain/review/repositories/IReviewRepository';
import { TurfModel } from '@infrastructure/turf/models/TurfModel';
import { ReviewModel, type ReviewDocument } from '../models/ReviewModel.js';

@injectable()
export class ReviewRepository implements IReviewRepository {
  async create(input: CreateReviewPersistenceInput): Promise<ReviewDTO> {
    const session = await mongoose.startSession();
    let created: ReviewDocument | undefined;
    try {
      await session.withTransaction(async () => {
        [created] = await ReviewModel.create([input], { session });
        const [summary] = await ReviewModel.aggregate<{ average: number; count: number }>([
          { $match: { turfId: new mongoose.Types.ObjectId(input.turfId) } },
          { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]).session(session);
        if (!summary) throw new Error('Review aggregate could not be calculated.');
        await TurfModel.updateOne(
          { _id: input.turfId },
          { $set: { rating: { avg: summary.average, count: summary.count } } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    if (!created) throw new Error('Review was not created.');
    return this.toDTO(created);
  }

  async findByBookingId(bookingId: string) {
    if (!mongoose.isValidObjectId(bookingId)) return null;
    const review = await ReviewModel.findOne({ bookingId });
    return review ? this.toDTO(review) : null;
  }

  async listByTurf(turfId: string, page: number, limit: number) {
    if (!mongoose.isValidObjectId(turfId)) return { items: [], total: 0, average: 0 };
    const filter = { turfId };
    const [items, total, summaries] = await Promise.all([
      ReviewModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ReviewModel.countDocuments(filter),
      ReviewModel.aggregate<{ average: number }>([
        { $match: { turfId: new mongoose.Types.ObjectId(turfId) } },
        { $group: { _id: null, average: { $avg: '$rating' } } },
      ]),
    ]);
    return {
      items: items.map((item) => this.toDTO(item)),
      total,
      average: summaries[0]?.average ?? 0,
    };
  }

  private toDTO(document: ReviewDocument): ReviewDTO {
    return {
      id: document._id.toString(),
      bookingId: document.bookingId.toString(),
      userId: document.userId.toString(),
      turfId: document.turfId.toString(),
      courtId: document.courtId.toString(),
      customerName: document.customerName,
      turfName: document.turfName,
      courtName: document.courtName,
      rating: document.rating,
      comment: document.comment,
      createdAt: document.createdAt.toISOString(),
    };
  }
}
