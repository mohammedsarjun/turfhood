import type {
  IAmenityRepository,
  ListAmenitiesParams,
  ListAmenitiesResult,
} from '../../src/domain/amenity/repositories/IAmenityRepository.js';
import { Amenity } from '../../src/domain/amenity/entities/Amenity.js';

interface FakeAmenityRepositoryOptions {
  /** Returned by findById(); set this to simulate "an amenity with this id exists". */
  existingById?: Amenity | null;
  /** Returned by findByName(); set this to simulate "an amenity with this name already exists". */
  existingByName?: Amenity | null;
  /** Returned by list(). */
  listResult?: ListAmenitiesResult;
}

/**
 * In-memory stand-in for the real Mongo-backed AmenityRepository.
 * Used by unit tests so they never touch a real database — the test decides
 * exactly what "already exists" means by passing options into the constructor.
 */
export class FakeAmenityRepository implements IAmenityRepository {
  public readonly createCalls: Amenity[] = [];
  public readonly updateCalls: Array<{ id: string; changes: { name?: string; icon?: string } }> =
    [];
  public readonly setListedCalls: Array<{ id: string; isListed: boolean }> = [];

  constructor(private readonly options: FakeAmenityRepositoryOptions = {}) {}

  async findById(): Promise<Amenity | null> {
    return this.options.existingById ?? null;
  }

  async findByName(): Promise<Amenity | null> {
    return this.options.existingByName ?? null;
  }

  async list(params: ListAmenitiesParams): Promise<ListAmenitiesResult> {
    void params;
    return this.options.listResult ?? { items: [], total: 0 };
  }

  async create(amenity: Amenity): Promise<Amenity> {
    this.createCalls.push(amenity);
    // Mirrors what the real Mongo-backed repository returns: a persisted entity with an
    // assigned id and timestamps, since Amenity.create() itself doesn't set either.
    return Amenity.fromPersistence({
      id: amenity.id ?? 'generated_id',
      name: amenity.name,
      ...(amenity.icon ? { icon: amenity.icon } : {}),
      isListed: amenity.isListed,
      createdAt: amenity.createdAt ?? new Date('2026-01-01'),
      updatedAt: amenity.updatedAt ?? new Date('2026-01-01'),
    });
  }

  async update(id: string, changes: { name?: string; icon?: string }): Promise<Amenity | null> {
    this.updateCalls.push({ id, changes });
    return this.options.existingById ?? null;
  }

  async setListed(id: string, isListed: boolean): Promise<Amenity | null> {
    this.setListedCalls.push({ id, isListed });
    return this.options.existingById ?? null;
  }
}
