import { Turf } from '../../src/domain/turf/entities/Turf.js';
import type { ITurfRepository } from '../../src/domain/turf/repositories/ITurfRepository.js';

/** In-memory stand-in for the real Mongo-backed TurfRepository — never touches a real database. */
export class FakeTurfRepository implements ITurfRepository {
  public readonly createCalls: Turf[] = [];

  async create(turf: Turf): Promise<Turf> {
    this.createCalls.push(turf);
    return Turf.fromPersistence({
      id: turf.id ?? 'generated_turf_id',
      ownerId: turf.ownerId,
      name: turf.name,
      ...(turf.description ? { description: turf.description } : {}),
      location: turf.location,
      address: turf.address,
      amenities: turf.amenities,
      sportsOffered: turf.sportsOffered,
      rating: turf.rating,
      status: turf.status,
      ...(turf.verificationId ? { verificationId: turf.verificationId } : {}),
      isDeleted: turf.isDeleted,
      createdAt: turf.createdAt ?? new Date('2026-01-01'),
      updatedAt: turf.updatedAt ?? new Date('2026-01-01'),
    });
  }
}
