import { Turf } from '../../src/domain/turf/entities/Turf.js';
import type {
  ITurfRepository,
  TurfDiscoveryRepositoryInput,
} from '../../src/domain/turf/repositories/ITurfRepository.js';

interface FakeTurfRepositoryOptions {
  existingTurf?: Turf | null;
  turfs?: Turf[];
}

/** In-memory stand-in for the real Mongo-backed TurfRepository. */
export class FakeTurfRepository implements ITurfRepository {
  public readonly createCalls: Turf[] = [];

  constructor(private readonly options: FakeTurfRepositoryOptions = {}) {}

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

  async findById(id: string): Promise<Turf | null> {
    return this.findFromOptions((turf) => turf.id === id);
  }

  async findOwnedByIdOrVerificationId(id: string, ownerId: string): Promise<Turf | null> {
    return this.findOwned(id, ownerId, ['approved']);
  }

  async findOwnedPortalByIdOrVerificationId(id: string, ownerId: string): Promise<Turf | null> {
    return this.findOwned(id, ownerId, ['approved', 'suspended']);
  }

  async findByVerificationIds(verificationIds: string[]): Promise<Turf[]> {
    return this.getTurfs().filter(
      (turf) => turf.verificationId && verificationIds.includes(turf.verificationId),
    );
  }

  async updateBasicDetails(): Promise<Turf | null> {
    return this.options.existingTurf ?? null;
  }

  async findApprovedById(id: string): Promise<Turf | null> {
    const turf = await this.findById(id);
    return turf?.status === 'approved' ? turf : null;
  }

  async findApprovedByIds(ids: string[]): Promise<Turf[]> {
    return this.getTurfs().filter(
      (turf) => turf.id && ids.includes(turf.id) && turf.status === 'approved',
    );
  }

  async findApprovedByCity(): Promise<Turf[]> {
    return this.getTurfs().filter((turf) => turf.status === 'approved');
  }

  async discover(_input: TurfDiscoveryRepositoryInput): Promise<{
    items: Turf[];
    total: number;
    distances: Map<string, number>;
  }> {
    const items = this.getTurfs().filter((turf) => turf.status === 'approved');
    return { items, total: items.length, distances: new Map() };
  }

  private findOwned(id: string, ownerId: string, statuses: Turf['status'][]): Turf | null {
    return this.findFromOptions(
      (turf) =>
        turf.ownerId === ownerId &&
        statuses.includes(turf.status) &&
        (turf.id === id || turf.verificationId === id),
    );
  }

  private findFromOptions(predicate: (turf: Turf) => boolean): Turf | null {
    return this.getTurfs().find(predicate) ?? null;
  }

  private getTurfs(): Turf[] {
    if (this.options.turfs) return this.options.turfs;
    return this.options.existingTurf ? [this.options.existingTurf] : [];
  }
}
