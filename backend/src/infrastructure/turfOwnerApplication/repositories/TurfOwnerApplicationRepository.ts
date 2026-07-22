import { injectable } from 'tsyringe';
import { TurfOwnerApplication } from '@domain/turfOwnerApplication/entities/TurfOwnerApplication';
import type {
  ITurfOwnerApplicationRepository,
  ListTurfOwnerApplicationsParams,
  ListTurfOwnerApplicationsResult,
} from '@domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository';

import {
  TurfOwnerApplicationModel,
  type TurfOwnerApplicationDocument,
} from '../models/TurfOwnerApplicationModel.js';

@injectable()
export class TurfOwnerApplicationRepository implements ITurfOwnerApplicationRepository {
  async findById(id: string): Promise<TurfOwnerApplication | null> {
    const doc = await TurfOwnerApplicationModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findPendingByApplicant(userId: string): Promise<TurfOwnerApplication | null> {
    const doc = await TurfOwnerApplicationModel.findOne({
      applicantUserId: userId,
      status: 'pending',
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findLatestByApplicant(userId: string): Promise<TurfOwnerApplication | null> {
    const doc = await TurfOwnerApplicationModel.findOne({ applicantUserId: userId }).sort({
      createdAt: -1,
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findAllByApplicant(userId: string): Promise<TurfOwnerApplication[]> {
    const docs = await TurfOwnerApplicationModel.find({ applicantUserId: userId }).sort({
      createdAt: -1,
    });
    return docs.map((doc) => this.toDomain(doc));
  }

  async list(params: ListTurfOwnerApplicationsParams): Promise<ListTurfOwnerApplicationsResult> {
    const filter: Record<string, unknown> = {};
    if (params.status) {
      filter.status = params.status;
    }

    const skip = (params.page - 1) * params.limit;
    const [docs, total] = await Promise.all([
      TurfOwnerApplicationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.limit),
      TurfOwnerApplicationModel.countDocuments(filter),
    ]);

    return { items: docs.map((doc) => this.toDomain(doc)), total };
  }

  async create(application: TurfOwnerApplication): Promise<TurfOwnerApplication> {
    const doc = await TurfOwnerApplicationModel.create({
      applicantUserId: application.applicantUserId,
      name: application.name,
      description: application.description,
      address: application.address,
      location: application.location,
      sportsOffered: application.sportsOffered,
      amenities: application.amenities,
      documents: application.documents,
      images: application.images,
      status: application.status,
    });
    return this.toDomain(doc);
  }

  async approve(
    id: string,
    reviewedBy: string,
    turfId: string,
  ): Promise<TurfOwnerApplication | null> {
    const doc = await TurfOwnerApplicationModel.findByIdAndUpdate(
      id,
      { $set: { status: 'approved', reviewedBy, turfId } },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async reject(
    id: string,
    reviewedBy: string,
    reason?: string,
  ): Promise<TurfOwnerApplication | null> {
    const doc = await TurfOwnerApplicationModel.findByIdAndUpdate(
      id,
      { $set: { status: 'rejected', reviewedBy, ...(reason ? { reviewNotes: reason } : {}) } },
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: TurfOwnerApplicationDocument): TurfOwnerApplication {
    return TurfOwnerApplication.fromPersistence({
      id: doc._id.toString(),
      applicantUserId: doc.applicantUserId.toString(),
      name: doc.name,
      ...(doc.description ? { description: doc.description } : {}),
      address: doc.address,
      location: doc.location,
      sportsOffered: doc.sportsOffered.map((id) => id.toString()),
      amenities: doc.amenities.map((id) => id.toString()),
      documents: doc.documents ?? [],
      images: doc.images ?? [],
      status: doc.status,
      ...(doc.reviewedBy ? { reviewedBy: doc.reviewedBy.toString() } : {}),
      ...(doc.reviewNotes ? { reviewNotes: doc.reviewNotes } : {}),
      ...(doc.turfId ? { turfId: doc.turfId.toString() } : {}),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
