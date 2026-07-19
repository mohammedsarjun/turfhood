import type { IUserRepository } from '../../src/domain/user/repositories/IUserRepository.js';
import type { User } from '../../src/domain/user/entities/User.js';
import type { Email } from '../../src/domain/user/value-objects/Email.js';
import type { Phone } from '../../src/domain/user/value-objects/Phone.js';

interface FakeUserRepositoryOptions {
  /** Returned by findById(); set this to simulate "a user with this id exists". */
  existingUserById?: User | null;
  /** Returned by findByEmail(); set this to simulate "an account with this email already exists". */
  existingUserByEmail?: User | null;
  /** Returned by findByPhone(); set this to simulate "an account with this phone already exists". */
  existingUserByPhone?: User | null;
  /** Returned by findByGoogleId(); set this to simulate "an account already linked to this Google id". */
  existingUserByGoogleId?: User | null;
}

/**
 * In-memory stand-in for the real Mongo-backed UserRepository.
 * Used by unit tests so they never touch a real database — the test decides
 * exactly what "already exists" means by passing options into the constructor.
 */
export class FakeUserRepository implements IUserRepository {
  public readonly updatePasswordCalls: Array<{ userId: string; passwordHash: string }> = [];
  public readonly markVerifiedCalls: string[] = [];
  public readonly linkGoogleAccountCalls: Array<{
    userId: string;
    googleId: string;
    avatarUrl?: string;
  }> = [];
  public readonly createCalls: User[] = [];
  public readonly updateNameCalls: Array<{ userId: string; name: string }> = [];
  public readonly updatePhoneCalls: Array<{ userId: string; phone: string }> = [];
  public readonly updateEmailCalls: Array<{ userId: string; email: string }> = [];
  public readonly updateAvatarUrlCalls: Array<{ userId: string; avatarUrl: string }> = [];
  public readonly addPasswordAuthCalls: Array<{ userId: string; passwordHash: string }> = [];

  constructor(private readonly options: FakeUserRepositoryOptions = {}) {}

  async findById(): Promise<User | null> {
    return this.options.existingUserById ?? null;
  }

  async findByEmail(): Promise<User | null> {
    return this.options.existingUserByEmail ?? null;
  }

  async findByPhone(): Promise<User | null> {
    return this.options.existingUserByPhone ?? null;
  }

  async findByGoogleId(): Promise<User | null> {
    return this.options.existingUserByGoogleId ?? null;
  }

  async create(user: User): Promise<User> {
    this.createCalls.push(user);
    return user;
  }

  async markVerified(email: Email): Promise<void> {
    this.markVerifiedCalls.push(email.toString());
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    this.updatePasswordCalls.push({ userId, passwordHash });
  }

  async linkGoogleAccount(userId: string, googleId: string, avatarUrl?: string): Promise<void> {
    this.linkGoogleAccountCalls.push({ userId, googleId, ...(avatarUrl ? { avatarUrl } : {}) });
  }

  async updateName(userId: string, name: string): Promise<void> {
    this.updateNameCalls.push({ userId, name });
  }

  async updatePhone(userId: string, phone: Phone): Promise<void> {
    this.updatePhoneCalls.push({ userId, phone: phone.toString() });
  }

  async updateEmail(userId: string, email: Email): Promise<void> {
    this.updateEmailCalls.push({ userId, email: email.toString() });
  }

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    this.updateAvatarUrlCalls.push({ userId, avatarUrl });
  }

  async addPasswordAuth(userId: string, passwordHash: string): Promise<void> {
    this.addPasswordAuthCalls.push({ userId, passwordHash });
  }
}
