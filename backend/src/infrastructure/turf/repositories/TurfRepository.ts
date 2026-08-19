import { injectable } from 'tsyringe';
import { Turf } from '@domain/turf/entities/Turf';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';

import { TurfModel, type TurfDocument } from '../models/TurfModel.js';
import { TurfOwnerApplicationModel } from '../../turfOwnerApplication/models/TurfOwnerApplicationModel.js';

@injectable()
export class TurfRepository implements ITurfRepository {
  async create(turf: Turf): Promise<Turf> {
    const doc = await TurfModel.create({
      ownerId: turf.ownerId,
      name: turf.name,
      description: turf.description,
      location: turf.location,
      address: turf.address,
      amenities: turf.amenities,
      sportsOffered: turf.sportsOffered,
      rating: turf.rating,
      status: turf.status,
      verificationId: turf.verificationId,
      isDeleted: turf.isDeleted,
    });
    return this.toDomain(doc);
  }

  async findOwnedByIdOrVerificationId(id: string, ownerId: string): Promise<Turf | null> {
    let doc = await TurfModel.findOne({
      ownerId,
      isDeleted: false,
      status: 'approved',
      $or: [{ _id: id }, { verificationId: id }],
    });
    if (!doc) {
      const application = await TurfOwnerApplicationModel.findOne({
        _id: id,
        applicantUserId: ownerId,
        status: 'approved',
        turfId: { $exists: true },
      }).select('turfId');
      if (application?.turfId) {
        doc = await TurfModel.findOne({
          _id: application.turfId,
          ownerId,
          isDeleted: false,
          status: 'approved',
        });
      }
    }
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: TurfDocument): Turf {
    return Turf.fromPersistence({
      id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      name: doc.name,
      ...(doc.description ? { description: doc.description } : {}),
      location: doc.location,
      address: doc.address,
      amenities: doc.amenities,
      sportsOffered: doc.sportsOffered.map((id) => id.toString()),
      rating: doc.rating,
      status: doc.status,
      ...(doc.verificationId ? { verificationId: doc.verificationId.toString() } : {}),
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
