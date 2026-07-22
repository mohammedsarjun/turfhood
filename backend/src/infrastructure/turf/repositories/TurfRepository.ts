import { injectable } from 'tsyringe';
import { Turf } from '@domain/turf/entities/Turf';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';

import { TurfModel, type TurfDocument } from '../models/TurfModel.js';

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
