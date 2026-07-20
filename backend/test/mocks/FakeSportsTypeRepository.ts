import type {
  ISportsTypeRepository,
  ListSportsTypesParams,
  ListSportsTypesResult,
} from '../../src/domain/sportsType/repositories/ISportsTypeRepository.js';
import { SportsType } from '../../src/domain/sportsType/entities/SportsType.js';

interface FakeSportsTypeRepositoryOptions {
  /** Returned by findById(); set this to simulate "a sport with this id exists". */
  existingById?: SportsType | null;
  /** Returned by findByName(); set this to simulate "a sport with this name already exists". */
  existingByName?: SportsType | null;
  /** Returned by list(). */
  listResult?: ListSportsTypesResult;
}

/**
 * In-memory stand-in for the real Mongo-backed SportsTypeRepository.
 * Used by unit tests so they never touch a real database — the test decides
 * exactly what "already exists" means by passing options into the constructor.
 */
export class FakeSportsTypeRepository implements ISportsTypeRepository {
  public readonly createCalls: SportsType[] = [];
  public readonly updateCalls: Array<{ id: string; changes: { name?: string; icon?: string } }> =
    [];
  public readonly setListedCalls: Array<{ id: string; isListed: boolean }> = [];

  constructor(private readonly options: FakeSportsTypeRepositoryOptions = {}) {}

  async findById(): Promise<SportsType | null> {
    return this.options.existingById ?? null;
  }

  async findByName(): Promise<SportsType | null> {
    return this.options.existingByName ?? null;
  }

  async list(params: ListSportsTypesParams): Promise<ListSportsTypesResult> {
    void params;
    return this.options.listResult ?? { items: [], total: 0 };
  }

  async create(sportsType: SportsType): Promise<SportsType> {
    this.createCalls.push(sportsType);
    // Mirrors what the real Mongo-backed repository returns: a persisted entity with an
    // assigned id and timestamps, since SportsType.create() itself doesn't set either.
    return SportsType.fromPersistence({
      id: sportsType.id ?? 'generated_id',
      name: sportsType.name,
      ...(sportsType.icon ? { icon: sportsType.icon } : {}),
      isListed: sportsType.isListed,
      createdAt: sportsType.createdAt ?? new Date('2026-01-01'),
      updatedAt: sportsType.updatedAt ?? new Date('2026-01-01'),
    });
  }

  async update(id: string, changes: { name?: string; icon?: string }): Promise<SportsType | null> {
    this.updateCalls.push({ id, changes });
    return this.options.existingById ?? null;
  }

  async setListed(id: string, isListed: boolean): Promise<SportsType | null> {
    this.setListedCalls.push({ id, isListed });
    return this.options.existingById ?? null;
  }
}
