import type { IUserRepository } from '../../src/domain/user/repositories/IUserRepository.js';
import type { User } from '../../src/domain/user/entities/User.js';

interface FakeUserRepositoryOptions {
  /** Returned by findByEmail(); set this to simulate "an account with this email already exists". */
  existingUserByEmail?: User | null;
  /** Returned by findByPhone(); set this to simulate "an account with this phone already exists". */
  existingUserByPhone?: User | null;
}

/**
 * In-memory stand-in for the real Mongo-backed UserRepository.
 * Used by unit tests so they never touch a real database — the test decides
 * exactly what "already exists" means by passing options into the constructor.
 */
export class FakeUserRepository implements IUserRepository {
  constructor(private readonly options: FakeUserRepositoryOptions = {}) {}

  async findByEmail(): Promise<User | null> {
    return this.options.existingUserByEmail ?? null;
  }

  async findByPhone(): Promise<User | null> {
    return this.options.existingUserByPhone ?? null;
  }

  async create(user: User): Promise<User> {
    return user;
  }
}
